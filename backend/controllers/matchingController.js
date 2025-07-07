const Caregiver = require('../models/Caregiver');
const tfidfSimilarity = require('../utils/tfidfSimilarity');

exports.matchCaregivers = async (req, res) => {
  try {
    const { locationCoordinates, careType, schedule, specialNeeds } = req.body;

    // Basic validation
    if (!locationCoordinates || !Array.isArray(locationCoordinates) || locationCoordinates.length !== 2) {
      return res.status(400).json({ message: 'Invalid or missing location coordinates' });
    }

    const [lng, lat] = locationCoordinates;

    // Step 1: Find nearby & verified caregivers (within 25 km radius)
    const nearbyCaregivers = await Caregiver.find({
      isVerified: true,
      'location.coordinates': {
        $geoWithin: {
          $centerSphere: [[lng, lat], 25 / 6378.1], // Earth radius in km
        },
      },
    });

    if (!nearbyCaregivers.length) {
      return res.status(404).json({ message: 'No caregivers found within your area' });
    }

    // Step 2: Prepare seeker's vector
    const seekerVector = `${careType || ''} ${specialNeeds || ''} ${schedule || ''}`.toLowerCase();

    // Step 3: Score each caregiver using TF-IDF similarity
    const scored = nearbyCaregivers.map(cg => {
      const caregiverVector = [
        ...(cg.specializations || []),
        ...(cg.qualifications || []),
        ...(cg.servicesOffered || []),
        ...(cg.availability?.days || []),
        ...(cg.languagesSpoken || []),
        cg.bio || ''
      ]
      .join(' ')
      .toLowerCase();

      const similarity = tfidfSimilarity(seekerVector, caregiverVector);

      return { caregiver: cg, similarity };
    });

    // Step 4: Sort by similarity (high to low)
    const sorted = scored.sort((a, b) => b.similarity - a.similarity);

    // Step 5: Return top 5 (or fewer)
    const topCaregivers = sorted.slice(0, 5).map(item => item.caregiver);

    res.status(200).json(topCaregivers);
  } catch (error) {
    console.error('❌ Matching error:', error);
    res.status(500).json({ message: 'Server error during matching' });
  }
};

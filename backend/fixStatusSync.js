require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Caregiver = require('./models/Caregiver');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TogetherCare')
  .then(() => {
    console.log('✅ MongoDB connected for status sync fix');
    fixStatusSync();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function fixStatusSync() {
  try {
    console.log('🔧 Starting status synchronization fix...');

    // Get all caregivers
    const caregivers = await Caregiver.find().populate('user');
    console.log(`📊 Found ${caregivers.length} caregivers to process`);

    let updatedCount = 0;
    let errors = [];

    for (const caregiver of caregivers) {
      try {
        const user = caregiver.user;
        if (!user) {
          console.log(`⚠️  Caregiver ${caregiver._id} has no associated user`);
          continue;
        }

        let needsUpdate = false;
        let updateData = {};

        // Check User status vs Caregiver isVerified
        if (user.status === 'approved' && !caregiver.isVerified) {
          updateData.isVerified = true;
          needsUpdate = true;
          console.log(`✅ Fixing: User ${user.username} is approved but caregiver not verified`);
        } else if (user.status === 'rejected' && caregiver.isVerified) {
          updateData.isVerified = false;
          needsUpdate = true;
          console.log(`❌ Fixing: User ${user.username} is rejected but caregiver is verified`);
        } else if (user.status === 'pending' && caregiver.isVerified) {
          updateData.isVerified = false;
          needsUpdate = true;
          console.log(`⏳ Fixing: User ${user.username} is pending but caregiver is verified`);
        }

        // Check if User status should be pending for caregivers
        if (user.role === 'caregiver' && user.status === 'active' && !user.status) {
          // This is a new caregiver that should be pending
          await User.findByIdAndUpdate(user._id, { status: 'pending' });
          console.log(`🔄 Setting new caregiver ${user.username} status to pending`);
          needsUpdate = true;
        }

        if (needsUpdate) {
          await Caregiver.findByIdAndUpdate(caregiver._id, updateData);
          updatedCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing caregiver ${caregiver._id}:`, error.message);
        errors.push({ caregiverId: caregiver._id, error: error.message });
      }
    }

    // Summary
    console.log('\n📋 Status Sync Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} caregivers`);
    console.log(`❌ Errors encountered: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(({ caregiverId, error }) => {
        console.log(`  - ${caregiverId}: ${error}`);
      });
    }

    // Verify the fix
    console.log('\n🔍 Verification:');
    const verificationResults = await verifyStatusSync();
    console.log(`✅ Verified correct: ${verificationResults.correct}`);
    console.log(`❌ Still incorrect: ${verificationResults.incorrect}`);

    console.log('\n🎉 Status synchronization fix completed!');
    process.exit(0);

  } catch (error) {
    console.error('💥 Fatal error during status sync:', error);
    process.exit(1);
  }
}

async function verifyStatusSync() {
  const caregivers = await Caregiver.find().populate('user');
  let correct = 0;
  let incorrect = 0;

  for (const caregiver of caregivers) {
    const user = caregiver.user;
    if (!user) continue;

    const isCorrect = (
      (user.status === 'approved' && caregiver.isVerified === true) ||
      (user.status === 'rejected' && caregiver.isVerified === false) ||
      (user.status === 'pending' && caregiver.isVerified === false)
    );

    if (isCorrect) {
      correct++;
    } else {
      incorrect++;
      console.log(`  ❌ Mismatch: User ${user.username} - status: ${user.status}, isVerified: ${caregiver.isVerified}`);
    }
  }

  return { correct, incorrect };
} 
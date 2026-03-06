import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // Clerk-specific fields
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User profile information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  
  profileImageUrl: {
    type: String,
    default: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
  },
  
  // Role and permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'editor', 'viewer'],
    default: 'user'
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps from Clerk
  lastSignInAt: {
    type: Date
  },
  
  // Analytics
  loginCount: {
    type: Number,
    default: 0
  },
  
  lastActiveAt: {
    type: Date
  },
  
  // Custom metadata for additional Clerk data or app-specific fields
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // User preferences for your app
  preferences: {
    newsletter: { type: Boolean, default: false },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'en' }
  }
}, {
  // Automatically add createdAt and updatedAt fields
  timestamps: true,
  
  // Configure how the model behaves when converted to JSON
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret._id;
      return ret;
    }
  }
});

// Virtual for getting full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`.trim();
  }
  if (this.firstName) return this.firstName;
  if (this.lastName) return this.lastName;
  return 'Anonymous User';
});

// Method to record user login
userSchema.methods.recordLogin = async function() {
  this.loginCount += 1;
  this.lastActiveAt = new Date();
  return this.save();
};

// Method to update from Clerk data
userSchema.methods.updateFromClerk = async function(clerkUserData) {
  const { first_name, last_name, image_url, last_sign_in_at } = clerkUserData;
  
  this.firstName = first_name || this.firstName;
  this.lastName = last_name || this.lastName;
  this.profileImageUrl = image_url || this.profileImageUrl;
  this.lastSignInAt = last_sign_in_at ? new Date(last_sign_in_at) : this.lastSignInAt;
  this.lastActiveAt = new Date();
  this.loginCount += 1;
  
  return this.save();
};

// STATIC METHOD: Find or create user from Clerk webhook data
userSchema.statics.findOrCreateFromClerk = async function(clerkUserData) {
  try {
    const { 
      id, 
      email_addresses, 
      primary_email_address_id,
      first_name, 
      last_name, 
      image_url, 
      last_sign_in_at 
    } = clerkUserData;
    
    // Get primary email
    const primaryEmailObj = email_addresses?.find(
      email => email.id === primary_email_address_id
    );
    const primaryEmail = primaryEmailObj?.email_address || email_addresses?.[0]?.email_address;
    
    if (!primaryEmail) {
      throw new Error('No email address found for user');
    }
    
    // Try to find existing user by clerkId
    let user = await this.findOne({ clerkId: id });
    
    if (user) {
      // Update existing user
      user.email = primaryEmail;
      user.firstName = first_name || user.firstName;
      user.lastName = last_name || user.lastName;
      user.profileImageUrl = image_url || user.profileImageUrl;
      user.lastSignInAt = last_sign_in_at ? new Date(last_sign_in_at) : user.lastSignInAt;
      user.lastActiveAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      
      await user.save();
      console.log(`✅ Updated existing user: ${id} (${primaryEmail})`);
    } else {
      // Create new user
      user = await this.create({
        clerkId: id,
        email: primaryEmail,
        firstName: first_name || '',
        lastName: last_name || '',
        profileImageUrl: image_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
        lastSignInAt: last_sign_in_at ? new Date(last_sign_in_at) : null,
        lastActiveAt: new Date(),
        loginCount: 1,
        role: 'user',
        isActive: true,
        preferences: {
          newsletter: false,
          theme: 'system',
          language: 'en'
        }
      });
      console.log(`✅ Created new user: ${id} (${primaryEmail})`);
    }
    
    return user;
  } catch (error) {
    console.error('❌ Error in findOrCreateFromClerk:', error.message);
    throw error;
  }
};

// STATIC METHOD: Find user by Clerk ID
userSchema.statics.findByClerkId = async function(clerkId) {
  return this.findOne({ clerkId });
};

// STATIC METHOD: Get user statistics
userSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ 
    lastActiveAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
  });
  const byRole = await this.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  
  return { total, active, byRole };
};

// Create and export the model
const User = mongoose.model('User', userSchema);

export default User;
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  profileImage: {
    type: String,
    default: null,
  },
  personalDetails: {
    fullName: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      default: 0,
    },
    dateOfBirth: {
      type: Date,
      default: Date.now,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", ""],
      default: "",
    },
    religion: {
      type: String,
      default: "",
    },
    caste: {
      type: String,
      default: "",
    },
    motherTongue: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    occupation: {
      type: String,
      default: "",
    },
    annualIncome: {
      type: Number,
      default: 0,
    },
    maritalStatus: {
      type: String,
      enum: ["unmarried", "divorced", "widowed", "separated", ""],
      default: "",
    },
    height: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    location: {
      state: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
      pincode: {
        type: String,
        default: "",
      },
    },
    aboutMe: {
      type: String,
      maxlength: 1000,
      default: "",
    },
  },
  familyDetails: {
    fatherName: {
      type: String,
      default: "",
    },
    motherName: {
      type: String,
      default: "",
    },
    brothers: {
      type: Number,
      default: 0,
    },
    sisters: {
      type: Number,
      default: 0,
    },
    familyBackground: {
      type: String,
      enum: ["nuclear", "joint", "extended", ""],
      default: "",
    },
    familyValues: {
      type: String,
      enum: ["traditional", "modern", "liberal"],
      default: "modern",
    },
    familyLocation: {
      state: String,
      city: String,
    },
  },
  propertyDetails: {
    hasAgriculturalLand: {
      type: Boolean,
      default: false,
    },
    agriculturalLandAcres: {
      type: Number,
      default: 0,
    },
    hasResidentialProperty: {
      type: Boolean,
      default: false,
    },
    residentialPropertyDetails: {
      type: String,
      default: "",
    },
    hasCommercialProperty: {
      type: Boolean,
      default: false,
    },
    commercialPropertyDetails: {
      type: String,
      default: "",
    },
    otherAssets: {
      type: String,
      default: "",
    },
    propertyDescription: {
      type: String,
      default: "",
    },
  },
  partnerPreferences: {
    ageRange: {
      min: {
        type: Number,
        default: 18,
      },
      max: {
        type: Number,
        default: 40,
      },
    },
    religion: {
      type: String,
      default: "",
    },
    caste: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    occupation: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    additionalPreferences: {
      type: String,
      maxlength: 500,
      default: "",
    },
    heightPreference: {
      min: Number,
      max: Number,
    },
    maritalStatusPreference: {
      type: [String],
      enum: ["unmarried", "divorced", "widowed", "separated"],
      default: [],
    },
  },
  photos: [
    {
      url: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        required: true,
      },
      isProfilePicture: {
        type: Boolean,
        default: false,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  visibilitySettings: {
    showAge: {
      type: Boolean,
      default: true,
    },
    showLocation: {
      type: Boolean,
      default: true,
    },
    showEducation: {
      type: Boolean,
      default: true,
    },
    showOccupation: {
      type: Boolean,
      default: true,
    },
    showIncome: {
      type: Boolean,
      default: false,
    },
    showPhotos: {
      type: Boolean,
      default: true,
    },
    showFamilyDetails: {
      type: Boolean,
      default: true,
    },
    showPropertyDetails: {
      type: Boolean,
      default: false,
    },
  },
  statistics: {
    profileViews: {
      type: Number,
      default: 0,
    },
    interestReceived: {
      type: Number,
      default: 0,
    },
    interestSent: {
      type: Number,
      default: 0,
    },
    matches: {
      type: Number,
      default: 0,
    },
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationDate: {
    type: Date,
  },
  profileCompletionPercentage: {
    type: Number,
    default: 0,
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to calculate profile completion
profileSchema.methods.calculateCompletion = function () {
  let totalFields = 0;
  let completedFields = 0;

  const personalFields = [
    "fullName",
    "age",
    "gender",
    "religion",
    "caste",
    "motherTongue",
    "education",
    "occupation",
    "annualIncome",
    "maritalStatus",
    "height",
    "weight",
  ];

  personalFields.forEach((field) => {
    totalFields++;
    if (
      this.personalDetails &&
      this.personalDetails[field] &&
      this.personalDetails[field] !== "" &&
      this.personalDetails[field] !== null &&
      this.personalDetails[field] !== 0
    ) {
      completedFields++;
    }
  });

  const locationFields = ["state", "city"];
  locationFields.forEach((field) => {
    totalFields++;
    if (
      this.personalDetails?.location &&
      this.personalDetails.location[field] &&
      this.personalDetails.location[field] !== ""
    ) {
      completedFields++;
    }
  });

  const familyFields = ["fatherName", "motherName", "familyBackground"];
  familyFields.forEach((field) => {
    totalFields++;
    if (
      this.familyDetails &&
      this.familyDetails[field] &&
      this.familyDetails[field] !== "" &&
      this.familyDetails[field] !== null
    ) {
      completedFields++;
    }
  });

  const preferenceFields = ["religion", "caste", "education", "occupation"];
  preferenceFields.forEach((field) => {
    totalFields++;
    if (
      this.partnerPreferences &&
      this.partnerPreferences[field] &&
      this.partnerPreferences[field] !== "" &&
      this.partnerPreferences[field] !== null
    ) {
      completedFields++;
    }
  });

  totalFields += 2;
  if (this.partnerPreferences?.ageRange) {
    if (
      this.partnerPreferences.ageRange.min &&
      this.partnerPreferences.ageRange.min > 0
    ) {
      completedFields++;
    }
    if (
      this.partnerPreferences.ageRange.max &&
      this.partnerPreferences.ageRange.max > 0
    ) {
      completedFields++;
    }
  }

  totalFields++;
  if (this.photos && this.photos.length > 0) {
    completedFields++;
  }

  totalFields++;
  if (this.profileImage) {
    completedFields++;
  }

  totalFields++;
  if (
    this.personalDetails?.aboutMe &&
    this.personalDetails.aboutMe.length > 10
  ) {
    completedFields++;
  }

  const percentage = Math.round((completedFields / totalFields) * 100);
  this.profileCompletionPercentage = percentage;
  this.isProfileComplete = percentage >= 70;

  return percentage;
};

profileSchema.index({ "personalDetails.fullName": "text" });
profileSchema.index({ "personalDetails.age": 1 });
profileSchema.index({ "personalDetails.gender": 1 });
profileSchema.index({ isPublic: 1 });
profileSchema.index({ isProfileComplete: 1 });

module.exports = mongoose.model("Profile", profileSchema);

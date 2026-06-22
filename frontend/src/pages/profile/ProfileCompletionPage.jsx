import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaCalendar,
  FaVenusMars,
  FaGlobe,
  FaGraduationCap,
  FaBriefcase,
  FaMoneyBillWave,
  FaRulerVertical,
  FaWeight,
  FaMapMarkerAlt,
  FaUserFriends,
  FaHome,
  FaHeart,
  FaCamera,
  FaUpload,
  FaSpinner,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaArrowRight,
  FaArrowLeft,
  FaInfoCircle,
} from "react-icons/fa";
import {
  createOrUpdateProfile,
  uploadPhotos,
} from "../../store/slices/profileSlice";
import { setProfileComplete } from "../../store/slices/authSlice";
import Layout from "../../components/common/Layout";
import { toast } from "react-toastify";

const steps = [
  { id: 1, title: "Personal Details", icon: FaUser },
  { id: 2, title: "Family Details", icon: FaUserFriends },
  { id: 3, title: "Partner Preferences", icon: FaHeart },
  { id: 4, title: "Property Details", icon: FaHome },
  { id: 5, title: "Photos", icon: FaCamera },
];

const ProfileCompletionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.profile);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      personalDetails: {
        location: { state: "", city: "" },
      },
      familyDetails: {
        brothers: 0,
        sisters: 0,
      },
      propertyDetails: {
        hasAgriculturalLand: false,
        hasResidentialProperty: false,
        hasCommercialProperty: false,
      },
    },
  });

  const onSubmit = async (data) => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      return;
    }

    try {
      let uploadedPhotos = [];
      if (selectedPhotos.length > 0) {
        setUploading(true);
        const photoResult = await dispatch(
          uploadPhotos({ photos: selectedPhotos }),
        );
        if (photoResult.payload) {
          uploadedPhotos = photoResult.payload.photos;
        }
        setUploading(false);
      }

      const profileData = {
        ...data,
        photos: uploadedPhotos,
      };

      const result = await dispatch(createOrUpdateProfile(profileData));
      if (result.payload) {
        dispatch(setProfileComplete());
        toast.success("Profile completed successfully!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to save profile");
    }
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const totalPhotos = selectedPhotos.length + files.length;
    if (totalPhotos > 4) {
      toast.error("You can upload a maximum of 4 photos only!");
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhotos((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalDetails();
      case 2:
        return renderFamilyDetails();
      case 3:
        return renderPartnerPreferences();
      case 4:
        return renderPropertyDetails();
      case 5:
        return renderPhotosStep();
      default:
        return null;
    }
  };

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name</label>
          <input
            {...register("personalDetails.fullName")}
            className="form-input"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="form-label">Age</label>
          <input
            type="number"
            {...register("personalDetails.age")}
            className="form-input"
            placeholder="Enter your age"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Date of Birth</label>
        <input
          type="date"
          {...register("personalDetails.dateOfBirth")}
          className="form-input"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Gender</label>
          <select
            {...register("personalDetails.gender")}
            className="form-input"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="form-label">Marital Status</label>
          <select
            {...register("personalDetails.maritalStatus")}
            className="form-input"
          >
            <option value="">Select Status</option>
            <option value="unmarried">Unmarried</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Religion</label>
          <input
            {...register("personalDetails.religion")}
            className="form-input"
            placeholder="Enter your religion"
          />
        </div>
        <div>
          <label className="form-label">Caste</label>
          <input
            {...register("personalDetails.caste")}
            className="form-input"
            placeholder="Enter your caste"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Mother Tongue</label>
        <input
          {...register("personalDetails.motherTongue")}
          className="form-input"
          placeholder="Enter your mother tongue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Education</label>
          <input
            {...register("personalDetails.education")}
            className="form-input"
            placeholder="Enter your education"
          />
        </div>
        <div>
          <label className="form-label">Occupation</label>
          <input
            {...register("personalDetails.occupation")}
            className="form-input"
            placeholder="Enter your occupation"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Annual Income (in INR)</label>
        <input
          type="number"
          {...register("personalDetails.annualIncome")}
          className="form-input"
          placeholder="Enter your annual income"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Height (cm)</label>
          <input
            type="number"
            {...register("personalDetails.height")}
            className="form-input"
            placeholder="Enter your height"
          />
        </div>
        <div>
          <label className="form-label">Weight (kg)</label>
          <input
            type="number"
            {...register("personalDetails.weight")}
            className="form-input"
            placeholder="Enter your weight"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">State</label>
          <input
            {...register("personalDetails.location.state")}
            className="form-input"
            placeholder="Enter your state"
          />
        </div>
        <div>
          <label className="form-label">City</label>
          <input
            {...register("personalDetails.location.city")}
            className="form-input"
            placeholder="Enter your city"
          />
        </div>
      </div>

      <div>
        <label className="form-label">About Me</label>
        <textarea
          {...register("personalDetails.aboutMe")}
          className="form-input"
          rows="4"
          placeholder="Tell us about yourself..."
        />
      </div>
    </div>
  );

  const renderFamilyDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Father's Name</label>
          <input
            {...register("familyDetails.fatherName")}
            className="form-input"
            placeholder="Enter father's name"
          />
        </div>
        <div>
          <label className="form-label">Mother's Name</label>
          <input
            {...register("familyDetails.motherName")}
            className="form-input"
            placeholder="Enter mother's name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Number of Brothers</label>
          <input
            type="number"
            {...register("familyDetails.brothers")}
            className="form-input"
            placeholder="0"
          />
        </div>
        <div>
          <label className="form-label">Number of Sisters</label>
          <input
            type="number"
            {...register("familyDetails.sisters")}
            className="form-input"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Family Background</label>
        <select
          {...register("familyDetails.familyBackground")}
          className="form-input"
        >
          <option value="">Select Family Type</option>
          <option value="nuclear">Nuclear Family</option>
          <option value="joint">Joint Family</option>
          <option value="extended">Extended Family</option>
        </select>
      </div>
    </div>
  );

  const renderPartnerPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Minimum Age</label>
          <input
            type="number"
            {...register("partnerPreferences.ageRange.min")}
            className="form-input"
            placeholder="18"
          />
        </div>
        <div>
          <label className="form-label">Maximum Age</label>
          <input
            type="number"
            {...register("partnerPreferences.ageRange.max")}
            className="form-input"
            placeholder="40"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Preferred Religion</label>
        <input
          {...register("partnerPreferences.religion")}
          className="form-input"
          placeholder="Enter preferred religion"
        />
      </div>

      <div>
        <label className="form-label">Preferred Caste</label>
        <input
          {...register("partnerPreferences.caste")}
          className="form-input"
          placeholder="Enter preferred caste"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Preferred Education</label>
          <input
            {...register("partnerPreferences.education")}
            className="form-input"
            placeholder="Enter preferred education"
          />
        </div>
        <div>
          <label className="form-label">Preferred Occupation</label>
          <input
            {...register("partnerPreferences.occupation")}
            className="form-input"
            placeholder="Enter preferred occupation"
          />
        </div>
      </div>
    </div>
  );

  const renderPropertyDetails = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          {...register("propertyDetails.hasAgriculturalLand")}
          className="w-5 h-5"
        />
        <label className="form-label mb-0">Has Agricultural Land</label>
      </div>
      {watch("propertyDetails.hasAgriculturalLand") && (
        <div>
          <label className="form-label">Agricultural Land (in acres)</label>
          <input
            type="number"
            {...register("propertyDetails.agriculturalLandAcres")}
            className="form-input"
            placeholder="Enter acres"
          />
        </div>
      )}

      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          {...register("propertyDetails.hasResidentialProperty")}
          className="w-5 h-5"
        />
        <label className="form-label mb-0">Has Residential Property</label>
      </div>
      {watch("propertyDetails.hasResidentialProperty") && (
        <div>
          <label className="form-label">Residential Property Details</label>
          <textarea
            {...register("propertyDetails.residentialPropertyDetails")}
            className="form-input"
            rows="2"
            placeholder="Enter property details"
          />
        </div>
      )}

      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          {...register("propertyDetails.hasCommercialProperty")}
          className="w-5 h-5"
        />
        <label className="form-label mb-0">Has Commercial Property</label>
      </div>
      {watch("propertyDetails.hasCommercialProperty") && (
        <div>
          <label className="form-label">Commercial Property Details</label>
          <textarea
            {...register("propertyDetails.commercialPropertyDetails")}
            className="form-input"
            rows="2"
            placeholder="Enter property details"
          />
        </div>
      )}

      <div>
        <label className="form-label">Other Assets</label>
        <textarea
          {...register("propertyDetails.otherAssets")}
          className="form-input"
          rows="2"
          placeholder="Any other assets or investments..."
        />
      </div>

      <div>
        <label className="form-label">Property Description</label>
        <textarea
          {...register("propertyDetails.propertyDescription")}
          className="form-input"
          rows="3"
          placeholder="Additional details about properties..."
        />
      </div>
    </div>
  );

  const renderPhotosStep = () => (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary-maroon transition-colors">
        <FaUpload className="text-5xl text-gray-400 mx-auto mb-4" />
        <p className="text-text-dark font-medium mb-2">Upload Profile Photos</p>
        <p className="text-text-light text-sm mb-4">
          Upload up to 4 photos (Max 4 photos allowed)
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoUpload}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="btn-gold inline-block cursor-pointer"
        >
          <FaCamera className="inline mr-2" />
          Choose Photos
        </label>
      </div>

      {selectedPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {selectedPhotos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full h-40 object-cover rounded-xl"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              >
                <FaTrash className="w-4 h-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary-gold text-white text-xs px-2 py-1 rounded">
                  Profile Picture
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-4 flex items-start space-x-3">
        <FaInfoCircle className="text-blue-500 mt-1" />
        <div>
          <p className="text-sm text-text-dark font-medium">
            Why upload photos?
          </p>
          <p className="text-sm text-text-light">
            Profiles with photos receive 10x more interest. Your privacy is
            protected - photos are only visible to registered users.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-dark">
              Complete Your Profile
            </h1>
            <p className="text-text-light mt-2">
              Tell us about yourself to find the perfect match
            </p>
          </div>

          <div className="flex justify-between mb-8 relative">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-primary-maroon text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <FaCheckCircle /> : <Icon />}
                  </div>
                  <span
                    className={`text-xs mt-2 ${isActive ? "text-primary-maroon font-semibold" : "text-text-light"}`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-premium p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStep()}

              <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-text-dark hover:border-primary-maroon transition-colors"
                  >
                    <FaArrowLeft />
                    <span>Previous</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || uploading}
                  className={`ml-auto btn-maroon flex items-center space-x-2 ${
                    isLoading || uploading
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading || uploading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <span>
                        {currentStep === steps.length
                          ? "Complete Profile"
                          : "Next"}
                      </span>
                      <FaArrowRight />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center text-sm text-text-light">
            <p>
              Your profile is private until you complete it. Only complete
              profiles appear in search results.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileCompletionPage;

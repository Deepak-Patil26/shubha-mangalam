const Profile = require("../models/Profile.model");
const User = require("../models/User.model");

exports.searchProfiles = async (req, res) => {
  try {
    const {
      query,
      gender,
      ageMin,
      ageMax,
      religion,
      caste,
      education,
      occupation,
      annualIncomeMin,
      annualIncomeMax,
      maritalStatus,
      motherTongue,
      state,
      city,
      heightMin,
      heightMax,
      weightMin,
      weightMax,
      hasProperty,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // IMPORTANT: ONLY search for profiles with isPublic: true
    const searchQuery = { isPublic: true };

    // Text search
    if (query) {
      searchQuery.$or = [
        { "personalDetails.fullName": { $regex: query, $options: "i" } },
        { "personalDetails.education": { $regex: query, $options: "i" } },
        { "personalDetails.occupation": { $regex: query, $options: "i" } },
        { "personalDetails.location.city": { $regex: query, $options: "i" } },
        { "personalDetails.location.state": { $regex: query, $options: "i" } },
      ];
    }

    // Filters
    if (gender) {
      searchQuery["personalDetails.gender"] = gender;
    }

    if (ageMin || ageMax) {
      searchQuery["personalDetails.age"] = {};
      if (ageMin) searchQuery["personalDetails.age"].$gte = parseInt(ageMin);
      if (ageMax) searchQuery["personalDetails.age"].$lte = parseInt(ageMax);
    }

    if (religion) {
      searchQuery["personalDetails.religion"] = religion;
    }

    if (caste) {
      searchQuery["personalDetails.caste"] = caste;
    }

    if (education) {
      searchQuery["personalDetails.education"] = {
        $regex: education,
        $options: "i",
      };
    }

    if (occupation) {
      searchQuery["personalDetails.occupation"] = {
        $regex: occupation,
        $options: "i",
      };
    }

    if (annualIncomeMin || annualIncomeMax) {
      searchQuery["personalDetails.annualIncome"] = {};
      if (annualIncomeMin)
        searchQuery["personalDetails.annualIncome"].$gte =
          parseInt(annualIncomeMin);
      if (annualIncomeMax)
        searchQuery["personalDetails.annualIncome"].$lte =
          parseInt(annualIncomeMax);
    }

    if (maritalStatus) {
      searchQuery["personalDetails.maritalStatus"] = maritalStatus;
    }

    if (motherTongue) {
      searchQuery["personalDetails.motherTongue"] = motherTongue;
    }

    if (state) {
      searchQuery["personalDetails.location.state"] = {
        $regex: state,
        $options: "i",
      };
    }

    if (city) {
      searchQuery["personalDetails.location.city"] = {
        $regex: city,
        $options: "i",
      };
    }

    if (heightMin || heightMax) {
      searchQuery["personalDetails.height"] = {};
      if (heightMin)
        searchQuery["personalDetails.height"].$gte = parseInt(heightMin);
      if (heightMax)
        searchQuery["personalDetails.height"].$lte = parseInt(heightMax);
    }

    if (weightMin || weightMax) {
      searchQuery["personalDetails.weight"] = {};
      if (weightMin)
        searchQuery["personalDetails.weight"].$gte = parseInt(weightMin);
      if (weightMax)
        searchQuery["personalDetails.weight"].$lte = parseInt(weightMax);
    }

    if (hasProperty === "true") {
      searchQuery["$or"] = [
        { "propertyDetails.hasAgriculturalLand": true },
        { "propertyDetails.hasResidentialProperty": true },
        { "propertyDetails.hasCommercialProperty": true },
      ];
    }

    // Exclude current user's profile from their own search
    const currentUser = await User.findById(req.user.id);
    searchQuery.userId = { $ne: req.user.id };

    // Build sort - FIXED: define sort variable
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log("🔍 SEARCH QUERY:", JSON.stringify(searchQuery, null, 2));

    // Execute search
    const [profiles, total] = await Promise.all([
      Profile.find(searchQuery)
        .populate("userId", "fullName mobileNumber")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Profile.countDocuments(searchQuery),
    ]);

    console.log(`📊 FOUND ${profiles.length} profiles (total: ${total})`);

    // Log each profile's isPublic status
    profiles.forEach((p) => {
      console.log(
        `   - ${p.personalDetails?.fullName}: isPublic=${p.isPublic}`,
      );
    });

    res.status(200).json({
      profiles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

// Get search filters
exports.getSearchFilters = async (req, res) => {
  try {
    const [
      religions,
      castes,
      educations,
      occupations,
      motherTongues,
      states,
      cities,
    ] = await Promise.all([
      Profile.distinct("personalDetails.religion", { isPublic: true }),
      Profile.distinct("personalDetails.caste", { isPublic: true }),
      Profile.distinct("personalDetails.education", { isPublic: true }),
      Profile.distinct("personalDetails.occupation", { isPublic: true }),
      Profile.distinct("personalDetails.motherTongue", { isPublic: true }),
      Profile.distinct("personalDetails.location.state", { isPublic: true }),
      Profile.distinct("personalDetails.location.city", { isPublic: true }),
    ]);

    res.status(200).json({
      religions: religions.filter((r) => r),
      castes: castes.filter((c) => c),
      educations: educations.filter((e) => e),
      occupations: occupations.filter((o) => o),
      motherTongues: motherTongues.filter((m) => m),
      states: states.filter((s) => s),
      cities: cities.filter((c) => c),
    });
  } catch (error) {
    console.error("Get search filters error:", error);
    res
      .status(500)
      .json({ message: "Failed to get filters", error: error.message });
  }
};

// Get recently viewed profiles
exports.getRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user.id;

    const profiles = await Profile.find({
      "statistics.viewedBy": userId,
      isPublic: true,
    })
      .populate("userId", "fullName mobileNumber")
      .sort({ updatedAt: -1 })
      .limit(20);

    res.status(200).json({
      profiles,
      count: profiles.length,
    });
  } catch (error) {
    console.error("Get recently viewed error:", error);
    res
      .status(500)
      .json({ message: "Failed to get recently viewed", error: error.message });
  }
};

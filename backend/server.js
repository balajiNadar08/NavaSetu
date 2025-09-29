const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let patients = [];
let conditions = [];
let diseases = [];

// sample AYUSH diseases data
const sampleDiseases = [
  {
    id: "1",
    name: "Amlapitta",
    icd: "K25.9",
    tm2: "TM2001",
    description:
      "A digestive disorder characterized by hyperacidity and burning sensation in the stomach",
    category: "Digestive System",
    synonyms: ["Hyperacidity", "Acid Peptic Disease"],
  },
  {
    id: "2",
    name: "Arsha",
    icd: "K64.9",
    tm2: "TM2002",
    description:
      "Hemorrhoids or piles, characterized by swollen veins in the rectum and anus",
    category: "Digestive System",
    synonyms: ["Piles", "Hemorrhoids"],
  },
  {
    id: "3",
    name: "Sandhigata Vata",
    icd: "M19.9",
    tm2: "TM2003",
    description:
      "Osteoarthritis - degenerative joint disease affecting cartilage and bones",
    category: "Musculoskeletal System",
    synonyms: ["Osteoarthritis", "Joint Pain"],
  },
  {
    id: "4",
    name: "Madhumeha",
    icd: "E11.9",
    tm2: "TM2004",
    description:
      "Diabetes mellitus - a metabolic disorder characterized by high blood sugar levels",
    category: "Endocrine System",
    synonyms: ["Diabetes", "High Blood Sugar"],
  },
  {
    id: "5",
    name: "Kasa",
    icd: "R05",
    tm2: "TM2005",
    description: "Cough - a sudden expulsion of air from the lungs",
    category: "Respiratory System",
    synonyms: ["Cough", "Tussis"],
  },
  {
    id: "6",
    name: "Swasa",
    icd: "J44.9",
    tm2: "TM2006",
    description: "Breathlessness or dyspnea, difficulty in breathing",
    category: "Respiratory System",
    synonyms: ["Asthma", "Dyspnea", "Breathlessness"],
  },
  {
    id: "7",
    name: "Pratishyaya",
    icd: "J00",
    tm2: "TM2007",
    description: "Common cold or rhinitis with nasal congestion and discharge",
    category: "Respiratory System",
    synonyms: ["Common Cold", "Rhinitis"],
  },
  {
    id: "8",
    name: "Hridroga",
    icd: "I25.9",
    tm2: "TM2008",
    description: "Heart disease including various cardiac conditions",
    category: "Cardiovascular System",
    synonyms: ["Heart Disease", "Cardiac Disorder"],
  },
  {
    id: "9",
    name: "Unmada",
    icd: "F29",
    tm2: "TM2009",
    description: "Mental disorder or psychosis with altered consciousness",
    category: "Mental Health",
    synonyms: ["Psychosis", "Mental Disorder"],
  },
  {
    id: "10",
    name: "Apasmara",
    icd: "G40.9",
    tm2: "TM2010",
    description: "Epilepsy - a neurological disorder causing seizures",
    category: "Neurological System",
    synonyms: ["Epilepsy", "Seizure Disorder"],
  },
];

diseases = sampleDiseases;

// all routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "AYUSH Healthcare API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/diseases", (req, res) => {
  try {
    const { query, category, limit = 50, offset = 0 } = req.query;
    let filteredDiseases = [...diseases];

    if (query) {
      const searchTerm = query.toLowerCase();
      filteredDiseases = filteredDiseases.filter(
        (disease) =>
          disease.name.toLowerCase().includes(searchTerm) ||
          disease.synonyms.some((synonym) =>
            synonym.toLowerCase().includes(searchTerm)
          ) ||
          disease.description.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      filteredDiseases = filteredDiseases.filter(
        (disease) => disease.category.toLowerCase() === category.toLowerCase()
      );
    }

    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedDiseases = filteredDiseases.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedDiseases,
      meta: {
        total: filteredDiseases.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < filteredDiseases.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching diseases",
      error: error.message,
    });
  }
});

app.get("/api/diseases/:id", (req, res) => {
  try {
    const disease = diseases.find((d) => d.id === req.params.id);
    if (!disease) {
      return res.status(404).json({
        success: false,
        message: "Disease not found",
      });
    }
    res.json({ success: true, data: disease });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching disease",
      error: error.message,
    });
  }
});

app.get("/api/diseases/categories", (req, res) => {
  try {
    const categories = [...new Set(diseases.map((d) => d.category))];
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

app.post("/api/patients", (req, res) => {
  try {
    const patientData = req.body;

    if (!patientData.name || !patientData.dob || !patientData.gender) {
      return res.status(400).json({
        success: false,
        message: "Name, date of birth, and gender are required",
      });
    }

    const patient = {
      id: uuidv4(),
      ...patientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    patients.push(patient);

    res.status(201).json({
      success: true,
      data: patient,
      message: "Patient created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating patient",
      error: error.message,
    });
  }
});

app.get("/api/patients/:id", (req, res) => {
  try {
    const patient = patients.find((p) => p.id === req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching patient",
      error: error.message,
    });
  }
});

app.post("/api/patients/:patientId/conditions", (req, res) => {
  try {
    const { patientId } = req.params;
    const conditionData = req.body;

    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (conditionData.diseaseId) {
      const disease = diseases.find((d) => d.id === conditionData.diseaseId);
      if (!disease) {
        return res.status(404).json({
          success: false,
          message: "Disease not found",
        });
      }
    }

    const condition = {
      id: uuidv4(),
      patientId,
      ...conditionData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    conditions.push(condition);

    res.status(201).json({
      success: true,
      data: condition,
      message: "Condition created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating condition",
      error: error.message,
    });
  }
});

app.get("/api/fhir/patient/:patientId", (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const patientConditions = conditions.filter(
      (c) => c.patientId === patientId
    );

    const fhirPatient = {
      resourceType: "Patient",
      id: patient.id,
      meta: {
        profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
      },
      identifier: [
        {
          use: "usual",
          system: "http://ayush.gov.in/patient-id",
          value: patient.id,
        },
      ],
      active: true,
      name: [
        {
          use: "official",
          text: patient.name,
          family: patient.name.split(" ").pop(),
          given: patient.name.split(" ").slice(0, -1),
        },
      ],
      telecom: [
        ...(patient.phone
          ? [
              {
                system: "phone",
                value: patient.phone,
                use: "mobile",
              },
            ]
          : []),
        ...(patient.email
          ? [
              {
                system: "email",
                value: patient.email,
                use: "home",
              },
            ]
          : []),
      ],
      gender: patient.gender,
      birthDate: patient.dob,
      address:
        patient.address && patient.address.line
          ? [
              {
                use: "home",
                type: "physical",
                line: [patient.address.line],
                city: patient.address.city,
                state: patient.address.state,
                postalCode: patient.address.postalCode,
                country: patient.address.country || "India",
              },
            ]
          : [],
      contact:
        patient.emergencyContact && patient.emergencyContact.name
          ? [
              {
                relationship: [
                  {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0131",
                        code: "EP",
                        display: "Emergency contact person",
                      },
                    ],
                  },
                ],
                name: {
                  text: patient.emergencyContact.name,
                },
                telecom: [
                  {
                    system: "phone",
                    value: patient.emergencyContact.phone,
                  },
                ],
              },
            ]
          : [],
    };

    const fhirConditions = patientConditions.map((condition) => {
      const disease = diseases.find((d) => d.id === condition.diseaseId);

      return {
        resourceType: "Condition",
        id: condition.id,
        meta: {
          profile: ["http://hl7.org/fhir/StructureDefinition/Condition"],
        },
        clinicalStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/condition-clinical",
              code: "active",
              display: "Active",
            },
          ],
        },
        verificationStatus: {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/condition-ver-status",
              code: "confirmed",
              display: "Confirmed",
            },
          ],
        },
        category: [
          {
            coding: [
              {
                system:
                  "http://terminology.hl7.org/CodeSystem/condition-category",
                code: "problem-list-item",
                display: "Problem List Item",
              },
            ],
          },
        ],
        severity: {
          coding: [
            {
              system: "http://snomed.info/sct",
              code: "24484000",
              display: "Severe",
            },
          ],
        },
        code: disease
          ? {
              coding: [
                {
                  system: "http://id.who.int/icd/release/11/mms",
                  code: disease.icd,
                  display: disease.name,
                },
                {
                  system: "http://namaste.local/code-system",
                  code: disease.tm2,
                  display: `${disease.name} (NAMASTE)`,
                },
              ],
              text: disease.name,
            }
          : {
              text: "Unknown condition",
            },
        subject: {
          reference: `Patient/${patient.id}`,
          display: patient.name,
        },
        onsetDateTime: condition.onsetDate || new Date().toISOString(),
        recordedDate: condition.createdAt,
        recorder: {
          display: "AYUSH Healthcare System",
        },
        note: condition.notes
          ? [
              {
                text: condition.notes,
              },
            ]
          : [],
      };
    });

    const bundle = {
      resourceType: "Bundle",
      id: `bundle-${uuidv4()}`,
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: fhirPatient,
        },
        ...fhirConditions.map((condition) => ({
          resource: condition,
        })),
      ],
    };

    res.json({
      success: true,
      data: bundle,
      message: "FHIR bundle generated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating FHIR bundle",
      error: error.message,
    });
  }
});

app.post("/api/fhir/generate", (req, res) => {
  try {
    const { patient: patientData, disease, condition } = req.body;

    if (!patientData || !disease) {
      return res.status(400).json({
        success: false,
        message: "Patient data and disease information are required",
      });
    }

    const fhirPatient = {
      resourceType: "Patient",
      id: patientData.id || uuidv4(),
      meta: {
        profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
      },
      identifier: [
        {
          use: "usual",
          system: "http://ayush.gov.in/patient-id",
          value: patientData.id || uuidv4(),
        },
      ],
      active: true,
      name: [
        {
          use: "official",
          text: patientData.name,
          family: patientData.name.split(" ").pop(),
          given: patientData.name.split(" ").slice(0, -1),
        },
      ],
      telecom: [
        ...(patientData.phone
          ? [
              {
                system: "phone",
                value: patientData.phone,
                use: "mobile",
              },
            ]
          : []),
        ...(patientData.email
          ? [
              {
                system: "email",
                value: patientData.email,
                use: "home",
              },
            ]
          : []),
      ],
      gender: patientData.gender,
      birthDate: patientData.dob,
      address:
        patientData.address && patientData.address.line
          ? [
              {
                use: "home",
                type: "physical",
                line: [patientData.address.line],
                city: patientData.address.city,
                state: patientData.address.state,
                postalCode: patientData.address.postalCode,
                country: patientData.address.country || "India",
              },
            ]
          : [],
      contact:
        patientData.emergencyContact && patientData.emergencyContact.name
          ? [
              {
                relationship: [
                  {
                    coding: [
                      {
                        system: "http://terminology.hl7.org/CodeSystem/v2-0131",
                        code: "EP",
                        display: "Emergency contact person",
                      },
                    ],
                  },
                ],
                name: {
                  text: patientData.emergencyContact.name,
                },
                telecom: [
                  {
                    system: "phone",
                    value: patientData.emergencyContact.phone,
                  },
                ],
              },
            ]
          : [],
    };

    const fhirCondition = {
      resourceType: "Condition",
      id: uuidv4(),
      meta: {
        profile: ["http://hl7.org/fhir/StructureDefinition/Condition"],
      },
      clinicalStatus: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
            code: "active",
            display: "Active",
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system:
              "http://terminology.hl7.org/CodeSystem/condition-ver-status",
            code: "confirmed",
            display: "Confirmed",
          },
        ],
      },
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/condition-category",
              code: "problem-list-item",
              display: "Problem List Item",
            },
          ],
        },
      ],
      severity: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "24484000",
            display: "Severe",
          },
        ],
      },
      code: {
        coding: [
          {
            system: "http://id.who.int/icd/release/11/mms",
            code: disease.icd,
            display: disease.name,
          },
          {
            system: "http://namaste.local/code-system",
            code: disease.tm2,
            display: `${disease.name} (NAMASTE)`,
          },
        ],
        text: disease.name,
      },
      subject: {
        reference: `Patient/${fhirPatient.id}`,
        display: patientData.name,
      },
      onsetDateTime: condition?.onsetDate || new Date().toISOString(),
      recordedDate: new Date().toISOString(),
      recorder: {
        display: "AYUSH Healthcare System",
      },
      note: [
        {
          text: `Patient history: ${
            patientData.medicalHistory || "Not specified"
          }. Allergies: ${
            patientData.allergies || "None reported"
          }. Current medications: ${
            patientData.currentMedications || "None reported"
          }.`,
        },
      ],
    };

    const bundle = {
      resourceType: "Bundle",
      id: `bundle-${uuidv4()}`,
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: [
        {
          resource: fhirPatient,
        },
        {
          resource: fhirCondition,
        },
      ],
    };

    res.json({
      success: true,
      data: bundle,
      message: "FHIR bundle generated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error generating FHIR bundle",
      error: error.message,
    });
  }
});

app.post("/api/fhir/validate", (req, res) => {
  try {
    const fhirResource = req.body;

    const errors = [];
    const warnings = [];

    if (!fhirResource.resourceType) {
      errors.push("Missing required field: resourceType");
    }

    if (!fhirResource.id) {
      warnings.push("Missing recommended field: id");
    }

    if (fhirResource.resourceType === "Patient") {
      if (!fhirResource.name || fhirResource.name.length === 0) {
        errors.push("Patient must have at least one name");
      }

      if (!fhirResource.gender) {
        warnings.push("Patient gender is recommended");
      }
    }

    if (fhirResource.resourceType === "Condition") {
      if (!fhirResource.code) {
        errors.push("Condition must have a code");
      }

      if (!fhirResource.subject) {
        errors.push("Condition must have a subject reference");
      }
    }

    if (fhirResource.resourceType === "Bundle") {
      if (!fhirResource.type) {
        errors.push("Bundle must have a type");
      }

      if (!fhirResource.entry || fhirResource.entry.length === 0) {
        warnings.push("Bundle should contain at least one entry");
      }
    }

    const isValid = errors.length === 0;

    res.json({
      success: true,
      data: {
        valid: isValid,
        errors,
        warnings,
        resourceType: fhirResource.resourceType,
        resourceId: fhirResource.id,
      },
      message: isValid
        ? "FHIR resource is valid"
        : "FHIR resource has validation errors",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating FHIR resource",
      error: error.message,
    });
  }
});

app.get("/api/patients", (req, res) => {
  try {
    const { limit = 10, offset = 0, search } = req.query;
    let filteredPatients = [...patients];

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredPatients = filteredPatients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm) ||
          (patient.email && patient.email.toLowerCase().includes(searchTerm)) ||
          (patient.phone && patient.phone.includes(search))
      );
    }

    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedPatients,
      meta: {
        total: filteredPatients.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: endIndex < filteredPatients.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching patients",
      error: error.message,
    });
  }
});

app.get("/api/patients/:patientId/conditions", (req, res) => {
  try {
    const { patientId } = req.params;
    const patientConditions = conditions.filter(
      (c) => c.patientId === patientId
    );

    const enrichedConditions = patientConditions.map((condition) => ({
      ...condition,
      disease: diseases.find((d) => d.id === condition.diseaseId),
    }));

    res.json({
      success: true,
      data: enrichedConditions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching patient conditions",
      error: error.message,
    });
  }
});

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AYUSH Healthcare API Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;

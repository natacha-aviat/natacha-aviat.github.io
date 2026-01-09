// Données des créneaux disponibles pour MaMaCollecte
// Format: { dateKey: { lieuId: { slotId: { time, capacity, lieuNom } } } }
const CRENEAUX_DISPONIBLES = {
    "2024-01-16": {
        "lieu1": {
            "slot1": {
                "time": "10:00 - 13:00",
                "capacity": 8,
                "lieuNom": "Aubervilliers"
            },
            "slot2": {
                "time": "13:00 - 16:00",
                "capacity": 15,
                "lieuNom": "Aubervilliers"
            },
            "slot3": {
                "time": "16:00 - 19:00",
                "capacity": 15,
                "lieuNom": "Aubervilliers"
            }
        },
        "lieu2": {
            "slot1": {
                "time": "10:00 - 13:00",
                "capacity": 8,
                "lieuNom": "Paris 19ème"
            },
            "slot2": {
                "time": "13:00 - 16:00",
                "capacity": 15,
                "lieuNom": "Paris 19ème"
            },
            "slot3": {
                "time": "16:00 - 19:00",
                "capacity": 15,
                "lieuNom": "Paris 19ème"
            }
        },
        "lieu3": {
            "slot1": {
                "time": "10:00 - 13:00",
                "capacity": 8,
                "lieuNom": "Pantin"
            },
            "slot2": {
                "time": "13:00 - 16:00",
                "capacity": 15,
                "lieuNom": "Pantin"
            },
            "slot3": {
                "time": "16:00 - 19:00",
                "capacity": 15,
                "lieuNom": "Pantin"
            }
        }
    },
    "2024-01-17": {
        "lieu1": {
            "slot1": {
                "time": "10:00 - 13:00",
                "capacity": 8,
                "lieuNom": "Aubervilliers"
            },
            "slot2": {
                "time": "13:00 - 16:00",
                "capacity": 15,
                "lieuNom": "Aubervilliers"
            },
            "slot3": {
                "time": "16:00 - 19:00",
                "capacity": 15,
                "lieuNom": "Aubervilliers"
            }
        },
        "lieu2": {
            "slot1": {
                "time": "10:00 - 13:00",
                "capacity": 8,
                "lieuNom": "Paris 19ème"
            },
            "slot2": {
                "time": "13:00 - 16:00",
                "capacity": 15,
                "lieuNom": "Paris 19ème"
            },
            "slot3": {
                "time": "16:00 - 19:00",
                "capacity": 15,
                "lieuNom": "Paris 19ème"
            }
        }
    },
    "2024-01-15": {
        "lieu2": {
            "slot1": {
                "time": "10:00 - 13:00",
                "capacity": 8,
                "lieuNom": "Paris 19ème"
            },
            "slot2": {
                "time": "13:00 - 16:00",
                "capacity": 15,
                "lieuNom": "Paris 19ème"
            },
            "slot3": {
                "time": "16:00 - 19:00",
                "capacity": 15,
                "lieuNom": "Paris 19ème"
            }
        },
        "lieu3": {
            "slot1": {
                "time": "10:00 - 13:00",
                "capacity": 8,
                "lieuNom": "Pantin"
            },
            "slot2": {
                "time": "13:00 - 16:00",
                "capacity": 15,
                "lieuNom": "Pantin"
            },
            "slot3": {
                "time": "16:00 - 19:00",
                "capacity": 15,
                "lieuNom": "Pantin"
            }
        }
    }
};

// Liste des lieux extraits des créneaux
const LIEUX_DISPONIBLES = [
    { id: "lieu1", name: "Aubervilliers" },
    { id: "lieu2", name: "Paris 19ème" },
    { id: "lieu3", name: "Pantin" }
];

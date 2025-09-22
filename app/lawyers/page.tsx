"use client";

import Sidebar from "@/components/sidebar";
import React, { useState, useEffect } from "react";

interface Lawyer {
  id: number;
  name: string;
  contact: string;
  panelCategory: string;
  courtName: string;
  state: string;
  district: string;
  dateOfEngagement: string;
  dateOfExpiry: string;
}

const LawyersPage = () => {
  const [lawyers] = useState<Lawyer[]>([
    {
      id: 1,
      name: "Adv. Rajesh Kumar",
      contact: "+91 98765 43210",
      panelCategory: "Civil & Criminal",
      courtName: "Bombay High Court",
      state: "Maharashtra",
      district: "Mumbai",
      dateOfEngagement: "2020-01-15",
      dateOfExpiry: "2025-01-14",
    },
    {
      id: 2,
      name: "Adv. Priya Sharma",
      contact: "+91 98123 45678",
      panelCategory: "Corporate Law",
      courtName: "Delhi High Court",
      state: "Delhi",
      district: "New Delhi",
      dateOfEngagement: "2021-03-10",
      dateOfExpiry: "2026-03-09",
    },
    {
      id: 3,
      name: "Adv. Suresh Patel",
      contact: "+91 97654 32109",
      panelCategory: "Family Law",
      courtName: "Karnataka High Court",
      state: "Karnataka",
      district: "Bangalore Urban",
      dateOfEngagement: "2019-07-22",
      dateOfExpiry: "2024-07-21",
    },
    {
      id: 4,
      name: "Adv. Meera Iyer",
      contact: "+91 96543 21098",
      panelCategory: "Constitutional Law",
      courtName: "Madras High Court",
      state: "Tamil Nadu",
      district: "Chennai",
      dateOfEngagement: "2020-11-05",
      dateOfExpiry: "2025-11-04",
    },
    {
      id: 5,
      name: "Adv. Vikram Modi",
      contact: "+91 95432 10987",
      panelCategory: "Commercial Law",
      courtName: "Gujarat High Court",
      state: "Gujarat",
      district: "Ahmedabad",
      dateOfEngagement: "2022-02-18",
      dateOfExpiry: "2027-02-17",
    },
  ]);

  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>(lawyers);
  const [currentStateFilter, setCurrentStateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    filterLawyers();
  }, [currentStateFilter, searchTerm, lawyers]);

  const filterLawyers = () => {
    let result = [...lawyers];

    // Apply state filter
    if (currentStateFilter !== "all") {
      result = result.filter((lawyer) => lawyer.state === currentStateFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (lawyer) =>
          lawyer.name.toLowerCase().includes(term) ||
          lawyer.contact.toLowerCase().includes(term) ||
          lawyer.panelCategory.toLowerCase().includes(term) ||
          lawyer.courtName.toLowerCase().includes(term) ||
          lawyer.district.toLowerCase().includes(term)
      );
    }

    setFilteredLawyers(result);
  };

  const handleStateFilter = (state: string) => {
    setCurrentStateFilter(state);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      filterLawyers();
    }
  };
  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen w-full">
        <Sidebar />
      <div className="p-6 h-screen overflow-auto">
        <div className="min-h-screen p-6">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-white opacity-10 rounded-full animate-float"></div>
            <div
              className="absolute top-40 right-20 w-24 h-24 bg-white opacity-5 rounded-full animate-float"
              style={{ animationDelay: "-2s" }}
            ></div>
            <div
              className="absolute bottom-20 left-1/4 w-40 h-40 bg-white opacity-5 rounded-full animate-float"
              style={{ animationDelay: "-4s" }}
            ></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Search and Filters */}
            <div
              className="rounded-2xl p-6 mb-8 main-container"
            >
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search Bar */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    onKeyPress={handleKeyPress}
                    placeholder="Search by name, contact, panel category, or court..."
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
                    style={{
                      background: "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  />
                </div>

                {/* Search Button */}
                <button
                  onClick={filterLawyers}
                  className="px-6 py-3 rounded-xl text-gray-700 font-medium hover:text-white transition-all duration-300"
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.2)";
                    e.currentTarget.style.transform = "translateY(0px)";
                  }}
                >
                  Search
                </button>
              </div>

              {/* State Filters */}
              <div className="mb-4">
                <h3 className="text-gray-700 font-semibold mb-3">
                  Filter by State:
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStateFilter("all")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      currentStateFilter === "all"
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                    style={{
                      background:
                        currentStateFilter === "all"
                          ? "rgba(103, 126, 234, 0.8)"
                          : "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      if (currentStateFilter !== "all") {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.4)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentStateFilter !== "all") {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.2)";
                        e.currentTarget.style.transform = "translateY(0px)";
                      }
                    }}
                  >
                    All States
                  </button>
                  {[
                    "Maharashtra",
                    "Delhi",
                    "Karnataka",
                    "Tamil Nadu",
                    "Gujarat",
                  ].map((state) => (
                    <button
                      key={state}
                      onClick={() => handleStateFilter(state)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        currentStateFilter === state
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                      style={{
                        background:
                          currentStateFilter === state
                            ? "rgba(103, 126, 234, 0.8)"
                            : "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                      onMouseEnter={(e) => {
                        if (currentStateFilter !== state) {
                          e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.4)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentStateFilter !== state) {
                          e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.2)";
                          e.currentTarget.style.transform = "translateY(0px)";
                        }
                      }}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div
              className="rounded-2xl overflow-hidden main-container"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  Lawyer Directory
                </h2>
                <p className="text-gray-600 mt-1">
                  Found {filteredLawyers.length} lawyers
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        S. No.
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Panel Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Court Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        State
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        District
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Operational Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLawyers.map((lawyer, index) => (
                      <tr
                        key={lawyer.id}
                        className="transition-all duration-200 hover:bg-gray-50/50"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "";
                          e.currentTarget.style.transform = "translateY(0px)";
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {lawyer.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lawyer.contact}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {lawyer.panelCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {lawyer.courtName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {lawyer.state}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {lawyer.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="text-xs">
                            <div className="font-medium">
                              {lawyer.dateOfEngagement}
                            </div>
                            <div className="text-gray-500">
                              to {lawyer.dateOfExpiry}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <style jsx global>{`
            @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");

            @keyframes float {
              0%,
              100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-20px);
              }
            }

            .animate-float {
              animation: float 6s ease-in-out infinite;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default LawyersPage;

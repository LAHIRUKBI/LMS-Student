// src/app/page_components/free_card_request/page.tsx

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { CreditCard, Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, Phone, MapPin, BookOpen, Check, Users } from "lucide-react";

interface FreeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export default function FreeCardRequestModal({ isOpen, onClose, currentUser }: FreeCardModalProps) {
  const [freeCardSubmitting, setFreeCardSubmitting] = useState(false);
  const [freeCardMsg, setFreeCardMsg] = useState({ type: "", text: "" });
  
  const [freeCardForm, setFreeCardForm] = useState({
    fatherName: "",
    fatherOccupation: "",
    fatherPhone: "",
    motherName: "",
    motherOccupation: "",
    motherPhone: "",
    hasGuardian: false,
    guardianName: "",
    guardianRelation: "",
    guardianPhone: "",
    familyBackground: "",
    phone: "",
    address: ""
  });

  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (currentUser) {
      setFreeCardForm(prev => ({
        ...prev,
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        fatherName: currentUser.fatherName || "",
        fatherOccupation: currentUser.fatherOccupation || "",
        fatherPhone: currentUser.fatherPhone || "",
        motherName: currentUser.motherName || "",
        motherOccupation: currentUser.motherOccupation || "",
        motherPhone: currentUser.motherPhone || "",
        hasGuardian: currentUser.hasGuardian || false,
        guardianName: currentUser.guardianName || "",
        guardianRelation: currentUser.guardianRelation || "",
        guardianPhone: currentUser.guardianPhone || ""
      }));
    }

    const fetchClasses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/classes/all");
        setAvailableClasses(res.data);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };

    if (isOpen) {
      fetchClasses();
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleClassToggle = (classId: string) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
    }
  };

  const handleFreeCardFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true;
    const regex = /^\d{10}$/;
    return regex.test(phone);
  };

  const handleFreeCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!freeCardForm.fatherName.trim() && !freeCardForm.motherName.trim() && !freeCardForm.hasGuardian) {
      setFreeCardMsg({ type: "error", text: "Please provide either Father's name, Mother's name, or Guardian details." });
      return;
    }

    if (freeCardForm.hasGuardian && (!freeCardForm.guardianName.trim() || !freeCardForm.guardianRelation.trim())) {
      setFreeCardMsg({ type: "error", text: "Please enter Guardian's name and relationship." });
      return;
    }

    if (!validatePhone(freeCardForm.phone)) {
      setFreeCardMsg({ type: "error", text: "Student phone number must be exactly 10 digits." });
      return;
    }

    if (selectedClassIds.length === 0) {
      setFreeCardMsg({ type: "error", text: "Please select at least one target class." });
      return;
    }

    // Validation for mandatory supporting documents
    if (selectedFiles.length === 0) {
      setFreeCardMsg({ type: "error", text: "Please upload at least one supporting document (PDF or Image)." });
      return;
    }

    setFreeCardSubmitting(true);
    setFreeCardMsg({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append("fatherName", freeCardForm.fatherName);
      data.append("fatherOccupation", freeCardForm.fatherOccupation);
      data.append("fatherPhone", freeCardForm.fatherPhone);
      data.append("motherName", freeCardForm.motherName);
      data.append("motherOccupation", freeCardForm.motherOccupation);
      data.append("motherPhone", freeCardForm.motherPhone);
      data.append("hasGuardian", String(freeCardForm.hasGuardian));
      data.append("guardianName", freeCardForm.guardianName);
      data.append("guardianRelation", freeCardForm.guardianRelation);
      data.append("guardianPhone", freeCardForm.guardianPhone);
      data.append("familyBackground", freeCardForm.familyBackground);
      data.append("phone", freeCardForm.phone);
      data.append("address", freeCardForm.address);
      data.append("studentName", currentUser?.name || "");
      data.append("email", currentUser?.email || "");
      data.append("selectedClasses", JSON.stringify(selectedClassIds));

      selectedFiles.forEach((file) => {
        data.append("files", file);
      });

      await axios.post("http://localhost:5000/api/free-card/student/free-card-request", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      setFreeCardMsg({ type: "success", text: "Free card request submitted successfully!" });
      setTimeout(() => {
        onClose();
        setSelectedClassIds([]);
        setSelectedFiles([]);
        setFreeCardMsg({ type: "", text: "" });
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setFreeCardMsg({ type: "error", text: err.response?.data?.message || "Failed to submit request." });
    } finally {
      setFreeCardSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in duration-300 my-8">
        
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Free Class Card Request</h3>
              <p className="text-[11px] text-slate-400">Provide family details, contact info, and select target classes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {freeCardMsg.text && (
          <div className={`flex items-center gap-2 py-2.5 px-4 rounded-xl mb-4 text-xs font-semibold ${freeCardMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {freeCardMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{freeCardMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleFreeCardSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          
          {/* Student Phone Number & Address (Read-only if available in the profile; otherwise, can be entered) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone size={12} /> Phone Number (10 Digits)
              </label>
              <input
                type="tel"
                maxLength={10}
                required
                value={freeCardForm.phone}
                readOnly={!!currentUser?.phone}
                onChange={(e) => setFreeCardForm({ ...freeCardForm, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="0712345678"
                className={`w-full mt-1 px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.phone ? 'opacity-75 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={12} /> Home Address
              </label>
              <input
                type="text"
                required
                value={freeCardForm.address}
                readOnly={!!currentUser?.address}
                onChange={(e) => setFreeCardForm({ ...freeCardForm, address: e.target.value })}
                placeholder="Enter home address"
                className={`w-full mt-1 px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.address ? 'opacity-75 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
              />
            </div>
          </div>

          {/* Father Details (Profile එකේ ඇතොත් Read-only ලෙස පෙන්වයි) */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Father's Details</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={freeCardForm.fatherName}
                readOnly={!!currentUser?.fatherName}
                onChange={(e) => setFreeCardForm({ ...freeCardForm, fatherName: e.target.value })}
                placeholder="Father's Name"
                className={`px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.fatherName ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''}`}
              />
              <input
                type="text"
                value={freeCardForm.fatherOccupation}
                readOnly={!!currentUser?.fatherOccupation}
                onChange={(e) => setFreeCardForm({ ...freeCardForm, fatherOccupation: e.target.value })}
                placeholder="Occupation (Optional)"
                className={`px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.fatherOccupation ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''}`}
              />
              <input
                type="tel"
                maxLength={10}
                value={freeCardForm.fatherPhone}
                readOnly={!!currentUser?.fatherPhone}
                onChange={(e) => setFreeCardForm({ ...freeCardForm, fatherPhone: e.target.value.replace(/\D/g, '') })}
                placeholder="Phone (10 Digits)"
                className={`px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.fatherPhone ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''}`}
              />
            </div>
          </div>

          {/* Mother Details */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase">Mother's Details</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                value={freeCardForm.motherName}
                readOnly={!!currentUser?.motherName}
                onChange={(e) => setFreeCardForm({ ...freeCardForm, motherName: e.target.value })}
                placeholder="Mother's Name"
                className={`px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.motherName ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''}`}
              />
              <input
                type="text"
                value={freeCardForm.motherOccupation}
                readOnly={!!currentUser?.motherOccupation}
                onChange={(e) => setFreeCardForm({ ...freeCardForm, motherOccupation: e.target.value })}
                placeholder="Occupation (Optional)"
                className={`px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.motherOccupation ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''}`}
              />
              <input
                type="tel"
                maxLength={10}
                value={freeCardForm.motherPhone}
                readOnly={!!currentUser?.motherPhone}
                onChange={(e) => setFreeCardForm({ ...freeCardForm, motherPhone: e.target.value.replace(/\D/g, '') })}
                placeholder="Phone (10 Digits)"
                className={`px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.motherPhone ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''}`}
              />
            </div>
          </div>

          {/* Guardian Checkbox & Details */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={freeCardForm.hasGuardian}
                disabled={currentUser?.hasGuardian !== undefined && currentUser?.hasGuardian !== false}
                onChange={(e) => setFreeCardForm({ ...freeCardForm, hasGuardian: e.target.checked })}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <Users size={14} /> Under other Guardian (Optional)
            </label>

            {freeCardForm.hasGuardian && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                <input
                  type="text"
                  required={freeCardForm.hasGuardian}
                  value={freeCardForm.guardianName}
                  readOnly={!!currentUser?.guardianName}
                  onChange={(e) => setFreeCardForm({ ...freeCardForm, guardianName: e.target.value })}
                  placeholder="Guardian Name"
                  className={`px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.guardianName ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''}`}
                />
                <input
                  type="text"
                  required={freeCardForm.hasGuardian}
                  value={freeCardForm.guardianRelation}
                  readOnly={!!currentUser?.guardianRelation}
                  onChange={(e) => setFreeCardForm({ ...freeCardForm, guardianRelation: e.target.value })}
                  placeholder="Relationship (e.g. Uncle)"
                  className={`px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.guardianRelation ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''}`}
                />
                <input
                  type="tel"
                  maxLength={10}
                  value={freeCardForm.guardianPhone}
                  readOnly={!!currentUser?.guardianPhone}
                  onChange={(e) => setFreeCardForm({ ...freeCardForm, guardianPhone: e.target.value.replace(/\D/g, '') })}
                  placeholder="Phone (10 Digits)"
                  className={`px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none ${currentUser?.guardianPhone ? 'opacity-75 cursor-not-allowed bg-slate-100' : ''}`}
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Family Background Description / Reason</label>
            <textarea
              required
              rows={3}
              value={freeCardForm.familyBackground}
              onChange={(e) => setFreeCardForm({ ...freeCardForm, familyBackground: e.target.value })}
              placeholder="Describe your current financial / family situation..."
              className="w-full mt-1 px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
            />
          </div>

          {/* Classes Selection Section */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <BookOpen size={12} /> Select Target Classes (Multiple allowed)
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              {availableClasses.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No classes available.</p>
              ) : (
                availableClasses.map((cls) => {
                  const isSelected = selectedClassIds.includes(cls._id);
                  const displayGrade = cls.grade === 'Other' ? cls.customGradeName : cls.grade;

                  return (
                    <div
                      key={cls._id}
                      onClick={() => handleClassToggle(cls._id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all border ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-semibold"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div>
                        <p className="font-bold">{displayGrade} - {cls.medium} ({cls.mode})</p>
                        <p className="text-[10px] text-slate-400">Teacher: {cls.teacherId?.name || "N/A"} | {cls.day} at {cls.startTime}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${isSelected ? "bg-amber-500 border-amber-500 text-white" : "border-slate-300 dark:border-slate-600"}`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Upload Supporting Documents (PDFs or Images) <span className="text-red-500">* (Required)</span></span>
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
              <Upload size={24} className="text-amber-500 mb-1" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click to browse files</span>
              <span className="text-[10px] text-slate-400">Supports PDF, PNG, JPG (At least 1 required)</span>
              <input
                type="file"
                multiple
                accept=".pdf,image/*"
                onChange={handleFreeCardFilesChange}
                className="hidden"
              />
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Selected Files ({selectedFiles.length}):</p>
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={14} className="text-amber-500 shrink-0" />
                    <span className="truncate text-slate-700 dark:text-slate-200">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={freeCardSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {freeCardSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
              <span>{freeCardSubmitting ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
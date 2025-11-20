"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDoctorProfile, updateDoctorProfile } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Camera, Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    qualifications: "",
    registrationNumber: "",
    clinicName: "",
    clinicAddress: "",
    clinicPhone: "",
    logoUrl: "",
    signatureUrl: ""
  });
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getDoctorProfile();
      if (profile) {
        setProfileData({
          name: profile.name || "",
          qualifications: profile.qualifications || "",
          registrationNumber: profile.registrationNumber || "",
          clinicName: profile.clinicName || "",
          clinicAddress: profile.clinicAddress || "",
          clinicPhone: profile.clinicPhone || "",
          logoUrl: profile.logoUrl || "",
          signatureUrl: profile.signatureUrl || ""
        });
      }
    };
    fetchProfile();
  }, []);

  const handleFieldChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field, event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleFieldChange(field, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateDoctorProfile(profileData);
    setLoading(false);
    
    if (result.success) {
      alert("Profile updated successfully!");
    } else {
      alert("Failed to update profile: " + result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and clinic information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Doctor Information</CardTitle>
            <CardDescription>Your personal and professional details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Dr. Your Name"
                  value={profileData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Qualifications</label>
                <Input
                  placeholder="MBBS, MD (General Medicine)"
                  value={profileData.qualifications}
                  onChange={(e) => handleFieldChange("qualifications", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Number</label>
              <Input
                placeholder="12345678"
                value={profileData.registrationNumber}
                onChange={(e) => handleFieldChange("registrationNumber", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
            <CardDescription>Details about your clinic or practice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Clinic Name</label>
              <Input
                placeholder="MediPrescribe Clinic"
                value={profileData.clinicName}
                onChange={(e) => handleFieldChange("clinicName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Clinic Address</label>
              <Textarea
                placeholder="123 Health Avenue, Medical District"
                value={profileData.clinicAddress}
                onChange={(e) => handleFieldChange("clinicAddress", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Clinic Phone</label>
              <Input
                placeholder="+1 234 567 890"
                value={profileData.clinicPhone}
                onChange={(e) => handleFieldChange("clinicPhone", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo and Signature */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Upload your clinic logo and signature for prescriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Clinic Logo</label>
              <div className="flex items-center gap-4">
                {profileData.logoUrl && (
                  <div className="h-20 w-20 border rounded-lg overflow-hidden bg-gray-50">
                    <img src={profileData.logoUrl} alt="Clinic Logo" className="h-full w-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                    <div className="text-center">
                      <Upload className="h-6 w-6 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-500 mt-1">Click to upload logo</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("logoUrl", e)}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Signature Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Signature</label>
              <div className="flex items-center gap-4">
                {profileData.signatureUrl && (
                  <div className="h-20 w-32 border rounded-lg overflow-hidden bg-gray-50">
                    <img src={profileData.signatureUrl} alt="Signature" className="h-full w-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                    <div className="text-center">
                      <Camera className="h-6 w-6 mx-auto text-gray-400" />
                      <p className="text-xs text-gray-500 mt-1">Click to upload signature</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload("signatureUrl", e)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

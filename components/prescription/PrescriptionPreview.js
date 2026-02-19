"use client";

import { useRef, forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getDoctorProfile } from "@/app/actions";

export const PrescriptionPreview = forwardRef(({ patient, diagnosis, medicines, advice, date, showDownloadButton = false, patientContact }, ref) => {
  const prescriptionRef = useRef(null);
  const [viewMode, setViewMode] = useState('office'); // 'office' | 'patient'
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getDoctorProfile();
      setDoctorProfile(profile);
    };
    fetchProfile();
  }, []);

  useImperativeHandle(ref, () => ({
    download: handleDownload
  }));

  // helper functions
  const addWatermark = (element, text) => {
    const watermark = document.createElement('div');
    watermark.style.position = 'absolute';
    watermark.style.top = '10px';
    watermark.style.right = '10px';
    watermark.style.padding = '4px 8px';
    watermark.style.backgroundColor = '#f3f4f6';
    watermark.style.border = '1px solid #d1d5db';
    watermark.style.borderRadius = '4px';
    watermark.style.fontSize = '12px';
    watermark.style.fontWeight = '600';
    watermark.style.color = '#374151';
    watermark.innerText = text;

    // Ensure relative positioning on parent for absolute child
    if (element.style.position !== 'absolute' && element.style.position !== 'relative') {
      element.style.position = 'relative';
    }
    element.appendChild(watermark);
  };

  const generatePDF = async (mode = 'combined') => { // mode: 'combined' | 'patient'
    if (!prescriptionRef.current) {
      console.error("Prescription ref is missing");
      return null;
    }

    try {
      console.log(`Starting PDF generation (Mode: ${mode})...`);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const captureOptions = {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 800,
      };

      const originalElement = prescriptionRef.current;
      const imgWidth = 210;

      // Helper to capture element
      const captureElement = async (element) => {
        document.body.appendChild(element);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render
        const canvas = await html2canvas(element, captureOptions);
        document.body.removeChild(element);
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        return { imgData, imgHeight };
      };

      const hasExternalMedicines = medicines.some(m => m.isExternal);

      // --- GENERATE DOCTOR'S COPY (ALL MEDICINES) ---
      if (mode === 'combined') {
        const cloneDoc = originalElement.cloneNode(true);
        // Setup styles
        cloneDoc.style.position = 'absolute';
        cloneDoc.style.left = '-9999px';
        cloneDoc.style.top = '0';
        cloneDoc.style.width = '800px';
        cloneDoc.style.display = 'block';
        cloneDoc.style.zIndex = '-1';

        // Ensure ALL rows are visible for Office Copy
        const tbody = cloneDoc.querySelector('tbody');
        if (tbody) {
          const rows = Array.from(tbody.querySelectorAll('tr'));
          rows.forEach(row => {
            row.style.display = 'table-row'; // Force show all
          });
        }

        addWatermark(cloneDoc, "OFFICE COPY (ALL MEDICINES)");

        const { imgData: imgDataDoc, imgHeight: imgHeightDoc } = await captureElement(cloneDoc);
        pdf.addImage(imgDataDoc, "JPEG", 0, 0, imgWidth, imgHeightDoc);
      }

      // --- GENERATE PATIENT'S COPY (EXTERNAL ONLY) ---
      if (mode === 'patient' || (mode === 'combined' && hasExternalMedicines)) {
        if (mode === 'combined') pdf.addPage();

        const clonePatient = originalElement.cloneNode(true);
        // Setup styles
        clonePatient.style.position = 'absolute';
        clonePatient.style.left = '-9999px';
        clonePatient.style.top = '0';
        clonePatient.style.width = '800px';
        clonePatient.style.display = 'block';
        clonePatient.style.zIndex = '-1';

        addWatermark(clonePatient, "PATIENT COPY (EXTERNAL ONLY)");

        // Filter rows
        const tbody = clonePatient.querySelector('tbody');
        if (tbody) {
          const rows = Array.from(tbody.querySelectorAll('tr'));
          rows.forEach(row => {
            const isExternal = row.getAttribute('data-external') === 'true';
            if (!isExternal) {
              row.style.display = 'none';
            } else {
              row.style.display = 'table-row'; // Make sure external ones are shown
            }
          });
        }

        const { imgData: imgDataPatient, imgHeight: imgHeightPatient } = await captureElement(clonePatient);
        pdf.addImage(imgDataPatient, "JPEG", 0, 0, imgWidth, imgHeightPatient);
      }

      return pdf;
    } catch (error) {
      console.error("Error generating PDF:", error);
      return null;
    }
  };

  const handleDownload = async () => {
    const pdf = await generatePDF('combined');
    if (pdf) {
      pdf.save(`Prescription_${patient.name || "Patient"}.pdf`);
      console.log("PDF saved");
    } else {
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleSendWhatsApp = async () => {
    if (!patientContact) {
      alert("Patient contact number is not available.");
      return;
    }

    try {
      // Generate ONLY Patient Copy (External Meds)
      const pdf = await generatePDF('patient');
      if (!pdf) {
        alert("Failed to generate PDF for sharing.");
        return;
      }

      const pdfBlob = pdf.output('blob');
      // Sanitize filename
      const safeName = (patient.name || "Patient").replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `Prescription_${safeName}_${Date.now()}.pdf`;

      // 2. Upload to Cloudinary
      // Dynamically import to avoid server-side issues if any, though this is a client component
      const { uploadPDFToCloudinary } = await import("@/lib/cloudinary-upload");

      // Show loading state (optional: could add a toast here)
      const uploadButton = document.getElementById('whatsapp-btn');
      if (uploadButton) uploadButton.innerText = "Uploading...";

      const uploadResult = await uploadPDFToCloudinary(pdfBlob, fileName);

      if (uploadButton) uploadButton.innerText = "Send WhatsApp";

      if (!uploadResult.success) {
        console.error("Upload failed:", uploadResult.error);
        alert(`Failed to upload prescription: ${uploadResult.error}\n\nPlease check your Cloudinary configuration.`);
        return;
      }

      // 3. Prepare WhatsApp Message
      const cleanNumber = patientContact.replace(/\D/g, '');
      const fileUrl = uploadResult.url;
      console.log("Cloudinary URL:", fileUrl); // Debugging log

      const message = `Hello ${patient.name || "Patient"},

Your prescription from ${doctorProfile?.clinicName || "our clinic"} is ready.

📋 Diagnosis: ${diagnosis || "N/A"}
📅 Date: ${date}

🔗 View/Download Prescription:
${fileUrl}

(Link valid for 30 days)

Best regards,
${doctorProfile?.name || "Doctor"}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

      // 4. Open WhatsApp
      window.open(whatsappUrl, '_blank');

    } catch (error) {
      console.error("Error sending to WhatsApp:", error);
      alert("Failed to process request. Please try again.");
      const uploadButton = document.getElementById('whatsapp-btn');
      if (uploadButton) uploadButton.innerText = "Send WhatsApp";
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-lg">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold">Patient Name: {patient.name}</span>
            <span className="text-gray-600">Date: {date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Age/Gender: {patient.age} Yrs / {patient.gender}</span>
            <span className="font-semibold">Diagnosis: {diagnosis}</span>
          </div>
          {patientContact && (
            <div className="text-xs text-gray-500">
              Phone: {patientContact}
            </div>
          )}
        </div>
        <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-xl flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between w-full">
            <CardTitle className="text-gray-700 flex items-center gap-2">
              <FileText className="h-5 w-5" /> Prescription Preview
            </CardTitle>
            {showDownloadButton && (
              <div className="flex gap-2">
                {patientContact && (
                  <Button id="whatsapp-btn" variant="outline" size="sm" onClick={handleSendWhatsApp} className="text-green-600 border-green-200 hover:bg-green-50">
                    <Send className="h-4 w-4 mr-2" /> Send WhatsApp
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleDownload} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex p-1 bg-gray-200 rounded-lg self-start">
            <button
              onClick={() => setViewMode('office')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'office'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Office Copy
            </button>
            <button
              onClick={() => setViewMode('patient')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'patient'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Patient Copy
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-white min-h-[600px]">
          <div
            ref={prescriptionRef}
            className="w-full bg-white p-8"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Header */}
            <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
                  {doctorProfile?.name || "Doctor Name"}
                </h1>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  {doctorProfile?.qualifications || "MBBS, MD (General Medicine)"}
                </p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Reg No: {doctorProfile?.registrationNumber || "12345678"}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {doctorProfile?.logoUrl && (
                  <img src={doctorProfile.logoUrl} alt="Clinic Logo" style={{ height: '50px', marginBottom: '8px', marginLeft: 'auto' }} />
                )}
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
                  {doctorProfile?.clinicName || "MediPrescribe Clinic"}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  {doctorProfile?.clinicAddress || "123 Health Avenue, Medical District"}
                </p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Phone: {doctorProfile?.clinicPhone || "+1 234 567 890"}
                </p>
              </div>
            </div>

            {/* Patient Info */}
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '14px', color: '#374151' }}><span style={{ fontWeight: '600' }}>Patient Name:</span> {patient.name || "—"}</p>
                <p style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}><span style={{ fontWeight: '600' }}>Age/Gender:</span> {patient.age ? `${patient.age} Yrs` : "—"} / {patient.gender || "—"}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '14px', color: '#374151' }}><span style={{ fontWeight: '600' }}>Date:</span> {date}</p>
                <p style={{ fontSize: '14px', color: '#374151', marginTop: '4px' }}><span style={{ fontWeight: '600' }}>Diagnosis:</span> {diagnosis || "—"}</p>
              </div>
            </div>

            {/* Medicines */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Prescribed Medicines</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Medicine</th>
                    <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Dosage</th>
                    <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Frequency</th>
                    <th style={{ padding: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        display: (viewMode === 'patient' && !med.isExternal) ? 'none' : 'table-row'
                      }}
                      data-external={med.isExternal}
                    >
                      <td style={{ padding: '12px 8px', fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {med.name || "—"}
                        {viewMode === 'office' && med.isExternal && (
                          <span style={{ marginLeft: '4px', fontSize: '10px', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 4px', borderRadius: '4px' }}>
                            External
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>{med.dosage || "—"}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>{med.frequency || "—"}</td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>{med.duration || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Advice */}
            {advice && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>Advice</h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>{advice}</p>
              </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                <p>Generated by MediPrescribe</p>
                <p>{date}</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ height: '40px', marginBottom: '8px' }}>
                  {doctorProfile?.signatureUrl && (
                    <img src={doctorProfile.signatureUrl} alt="Signature" style={{ height: '100%', maxWidth: '150px' }} />
                  )}
                </div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', borderTop: '1px solid #e5e7eb', paddingTop: '8px', paddingLeft: '24px', paddingRight: '24px' }}>Doctor&apsos;s Signature</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

PrescriptionPreview.displayName = "PrescriptionPreview";

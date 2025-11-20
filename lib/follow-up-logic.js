/**
 * Calculate follow-up duration and generate reminder message
 * Based on medical rules provided by the user
 */

export function calculateFollowUp(data) {
  const { diagnosis, age, severity, visitType, patientName, doctorName } = data;
  
  let days = 30; // Default for chronic/general
  let reason = "Routine follow-up check-up";
  
  const lowerDiagnosis = diagnosis?.toLowerCase() || "";
  
  // 1. Diagnosis Rules
  if (lowerDiagnosis.match(/fever|cold|flu|infection|tonsillitis|viral/)) {
    days = 5; // Range 2-5
    reason = "Short-term infection requires quick follow-up to check recovery";
  } else if (lowerDiagnosis.match(/surgery|operation|post-op/)) {
    days = 7; // Range 3-10
    reason = "Post-surgery recovery monitoring";
  } else if (lowerDiagnosis.match(/asthma|allergy/)) {
    days = 14; // Range 7-14
    reason = "Monitor response to allergy/asthma medication";
  } else if (lowerDiagnosis.match(/diabetes|hypertension|bp|thyroid|sugar/)) {
    days = 30;
    reason = "Regular monitoring for chronic condition";
  }

  // 2. Age Adjustment (> 60 years -> reduce by 20%)
  if (age && parseInt(age) > 60) {
    days = Math.floor(days * 0.8);
    reason += " (Adjusted for age)";
  }

  // 3. Severity Adjustment (Severe -> reduce by 40%)
  if (severity === "severe") {
    days = Math.floor(days * 0.6);
    reason += " (Urgent due to severity)";
  }

  // Ensure minimum 1 day
  days = Math.max(1, days);

  // Calculate Date
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + days);
  const dateString = followUpDate.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });

  // Generate Message
  const message = `👋 Hello ${patientName || "Patient"},
This is a reminder that your follow-up check-up with ${doctorName || "Dr."} is due on ${dateString}.
Reply "YES" to confirm or "RESCHEDULE" to change.`;

  return {
    follow_up_days: days,
    follow_up_date: followUpDate,
    reason: reason,
    reminder_message: message
  };
}

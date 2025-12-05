import { Project } from "../types";

// Static service to replace AI functionality
export const generateImpactReport = async (projects: Project[]): Promise<string> => {
  // Mock response since API key service is removed
  const totalRaised = projects.reduce((acc, p) => acc + p.raised, 0);
  const totalBeneficiaries = projects.reduce((acc, p) => acc + (p.beneficiaries || 0), 0);

  return `
    EXECUTIVE SUMMARY
    
    The Akhundian Foundation has successfully managed ${projects.length} projects this session, impacting over ${totalBeneficiaries.toLocaleString()} beneficiaries across Pakistan. 
    
    With a total fund mobilization of PKR ${totalRaised.toLocaleString()}, our initiatives in Health, Education, and Social Welfare have achieved significant milestones. We remain committed to sustainable development and transparency in all our operations.
  `;
};

export const generateThankYouMessage = async (donorName: string, amount: number, cause: string): Promise<string> => {
  // Static thank you message
  return `Dear ${donorName}, thank you for your generous donation of PKR ${amount.toLocaleString()} towards ${cause}. Your support enables us to continue our mission effectively.`;
};
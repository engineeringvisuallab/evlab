import heroWaterImg from '../assets/images/hero_water_infrastructure_3d_1790644410645.jpg';
import civil3dCorridorImg from '../assets/images/civil3d_highway_pipeline_corridor_1790644436511.jpg';
import buildingRevitImg from '../assets/images/building_residential_revit_render_1790644425118.jpg';
import cadChamberImg from '../assets/images/cad_blueprint_mechanical_chamber_1790644451376.jpg';
import holdingDrawingsImg from '../assets/images/ayatullah_engineer_holding_drawings_1790645633582.jpg';
import siteInspectionImg from '../assets/images/ayatullah_site_inspection_profile_1790645644518.jpg';
/**
 * Central Configuration for Md. Ayatullah Imani's Professional Engineering Portfolio
 * CAD Expert for Water Network Design & Hydraulic Modeller at Institute of Water Modelling (IWM)
 */

export interface PortfolioConfig {
  fullName: string;
  shortName: string;
  primaryPositioning: string;
  currentEmployer: string;
  supportingLine: string;
  location: string;
  email: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  linkedinUrl: string;
  githubUrl: string;
  facebookUrl?: string;
  evlabUrl: string;
  aytMartUrl: string;
  avatarUrl: string;
  sitePhotoUrl: string;
  heroImage: string;
  confidentialityNotice: string;
  membershipId: string;
}

export const PORTFOLIO_CONFIG: PortfolioConfig = {
  fullName: "MD. AYATULLAH IMANI",
  shortName: "Md. Ayatullah Imani",
  primaryPositioning: "CAD Expert for Water Network Design & Network Modeller",
  currentEmployer: "Institute of Water Modelling (IWM)",
  supportingLine:
    "CAD Expert at IWM (since March 2022). Specialist in AutoCAD, Civil 3D, WaterGEMS hydraulic network modeling, ArcGIS/QGIS, and mega water supply projects including Padma (Jashaldia) Ø2000mm transmission main, Khulna WASA Phase-2 WTPs, DWSNIP DMAs, and UNICEF refugee camp networks.",
  location: "Dhaka, Bangladesh",
  email: "ayatullahemani@gmail.com",
  whatsappNumber: "8801786840952",
  whatsappDisplay: "+880 1786-840952",
  linkedinUrl: "https://www.linkedin.com/in/md-ayatullah-imani-b3ba72266/",
  githubUrl: "https://github.com/engineeringvisuallab",
  facebookUrl: "https://www.facebook.com/ayatullahimani",
  evlabUrl: "https://engineeringvisuallab.github.io/evlab/",
  aytMartUrl: "https://aytmart.github.io/aytmart/",
  avatarUrl: holdingDrawingsImg,
  sitePhotoUrl: siteInspectionImg,
  heroImage: heroWaterImg,
  confidentialityNotice:
    "Engineering drawings, DMAs, and GIS datasets are presented for professional demonstration adhering to client guidelines.",
  membershipId: "MIDEB: 72993"
};

export function getWhatsAppLink(customMessage?: string): string {
  const number = PORTFOLIO_CONFIG.whatsappNumber.replace(/[^0-9]/g, "");
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  if (customMessage) {
    return `${base}?text=${encodeURIComponent(customMessage)}`;
  }
  return base;
}

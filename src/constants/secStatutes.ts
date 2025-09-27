export const SEC_RELEASE_PDF_URL = "https://www.sec.gov/files/rules/other/2025/33-11350.pdf"

export const VIOLATION_TO_STATUTES: Record<string, string[]> = {
  "insider_trading": ["15 U.S.C. 78u-1", "15 U.S.C. 78u-2", "15 U.S.C. 78ff"], // Include criminal penalties
  "disclosure_omission": ["15 U.S.C. 77t(d)", "15 U.S.C. 78t(d)", "15 U.S.C. 77x"], // Enhanced coverage
  "financial_restatement": ["15 U.S.C. 77t(d)", "15 U.S.C. 78t(d)", "15 U.S.C. 7215(c)(4)(D)(ii)"], // SOX linkage
  "esg_greenwashing": ["15 U.S.C. 77h-1(g)", "15 U.S.C. 77t(d)", "15 U.S.C. 80b-17"], // Comprehensive ESG penalties
  "sox_internal_controls": ["15 U.S.C. 7215(c)(4)(D)(ii)", "15 U.S.C. 78t(d)"], // Enhanced SOX
  "compensation_misrepresentation": ["15 U.S.C. 77t(d)", "15 U.S.C. 78t(d)", "15 U.S.C. 78ff"], // Include criminal
  "cross_document_inconsistency": ["15 U.S.C. 77t(d)", "15 U.S.C. 78t(d)", "15 U.S.C. 77x"], // Multiple statutes
  "litigation_risk": ["15 U.S.C. 77t(d)", "15 U.S.C. 78t(d)"], // Risk disclosure failures
  "temporal_anomaly": ["15 U.S.C. 78u-1", "15 U.S.C. 78t(d)", "15 U.S.C. 78ff"] // Timing manipulation
}
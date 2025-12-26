/**
 * Clause Content Formatter
 * Cleans up raw PDF-extracted text for better readability
 */

export function formatClauseContent(content: string): string {
  let formatted = content;

  // Remove page numbers like "- 113 -", "- 114 -"
  formatted = formatted.replace(/\s*-\s*\d+\s*-\s*/g, '\n\n');

  // Remove LMA document headers/footers
  formatted = formatted.replace(/LMA\.[A-Z]+\.[A-Za-z]+\.[A-Za-z]+\.?\s*\d*\s*\d+\s*[A-Za-z]+\s*\d+/g, '');
  formatted = formatted.replace(/LMA\.\w+\.\w+\.\w+\.\w+\.?\s*\d*/g, '');

  // Remove date patterns at end of lines (like "23 September 201928 February 2020")
  formatted = formatted.replace(/\d{1,2}\s+[A-Za-z]+\s+\d{4}\d{1,2}\s+[A-Za-z]+\s+\d{4}/g, '');
  formatted = formatted.replace(/\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*$/gm, '');

  // Clean up "Facility X Commitment" headers that are artifacts
  formatted = formatted.replace(/Facility [A-Z] Commitment\s*(Name of Original Lender)?/g, '\n');

  // Format SCHEDULE headers
  formatted = formatted.replace(/SCHEDULE\s+(\d+)/g, '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSCHEDULE $1\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Format PART headers
  formatted = formatted.replace(/PART\s+([IVX]+)\s+/g, '\n\n▸ PART $1: ');

  // Format numbered sections (1., 2., etc.)
  formatted = formatted.replace(/^(\d+)\.\s+([A-Z][a-z]+)/gm, '\n\n$1. $2');

  // Format lettered subsections ((a), (b), etc.)
  formatted = formatted.replace(/\(([a-z])\)\s+/g, '\n   ($1) ');

  // Format roman numeral subsections ((i), (ii), etc.)
  formatted = formatted.replace(/\(([ivx]+)\)\s+/g, '\n      ($1) ');

  // Clean up multiple consecutive newlines (max 2)
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Clean up spaces before punctuation
  formatted = formatted.replace(/\s+([.,;:])/g, '$1');

  // Clean up multiple spaces
  formatted = formatted.replace(/  +/g, ' ');

  // Trim whitespace from start and end
  formatted = formatted.trim();

  // Add proper paragraph breaks after periods followed by capital letters
  formatted = formatted.replace(/\.\s+([A-Z])/g, '.\n\n$1');

  // But fix cases where we broke numbered items
  formatted = formatted.replace(/\.\n\n(\d+\.)/g, '.\n\n$1');

  return formatted;
}

/**
 * Extract key terms from clause content for highlighting
 */
export function extractKeyTerms(content: string): string[] {
  const keyTermPatterns = [
    /[""]([^""]+)[""]/g,  // Quoted definitions
    /\b(Borrower|Lender|Agent|Guarantor|Obligor)\b/g,
    /\b(Facility|Commitment|Utilisation|Finance Documents?)\b/g,
    /\b(KPI|SPT|GHG|ESG|SBTi)\b/g,
    /\b(Margin|Interest|Rate|SOFR|SONIA|LIBOR)\b/g,
  ];

  const terms = new Set<string>();

  for (const pattern of keyTermPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        terms.add(match[1]);
      } else {
        terms.add(match[0]);
      }
    }
  }

  return Array.from(terms).slice(0, 20);
}

/**
 * Get a clean preview of clause content
 */
export function getClausePreview(content: string, maxLength: number = 200): string {
  const formatted = formatClauseContent(content);

  if (formatted.length <= maxLength) {
    return formatted;
  }

  // Find a good break point (end of sentence or clause)
  let breakPoint = formatted.lastIndexOf('. ', maxLength);
  if (breakPoint === -1 || breakPoint < maxLength * 0.5) {
    breakPoint = formatted.lastIndexOf(' ', maxLength);
  }
  if (breakPoint === -1) {
    breakPoint = maxLength;
  }

  return formatted.substring(0, breakPoint) + '...';
}

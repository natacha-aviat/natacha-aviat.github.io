/**
 * Options html2pdf partagées (aperçu HTML et export direct).
 */

/**
 * @param {Record<string, unknown>} [html2canvasExtra]
 * @param {string} [filename]
 */
export function html2PdfOptions(html2canvasExtra, filename) {
  return {
    margin: [12, 12, 12, 12],
    filename: filename || 'contrat-medlex.pdf',
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: Object.assign(
      {
        scale: 2,
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: 0,
      },
      html2canvasExtra || {}
    ),
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      avoid: '.medlex-pdf-visual-line',
    },
  };
}

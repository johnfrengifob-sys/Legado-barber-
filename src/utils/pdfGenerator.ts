import jsPDF from 'jspdf';
import { BarberLiquidation, BarberContract, Sale } from '../types';

export const generateLiquidationPDF = (
  liquidation: BarberLiquidation,
  salesList: Sale[] = []
): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // Header banner: Deep navy (#011d32)
  doc.setFillColor(1, 29, 50);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent line (#c5a059)
  doc.setFillColor(197, 160, 89);
  doc.rect(0, 28, pageWidth, 2, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LEGADO BARBER CLUB', 14, 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(197, 160, 89);
  doc.text('GESTIÓN INTEGRAL & CLUB EXCLUSIVO • COMPROBANTE OFICIAL DE LIQUIDACIÓN', 14, 19);

  // Voucher Number & Date in Header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`N° COMPROBANTE: ${liquidation.voucherNumber}`, pageWidth - 14, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Fecha de Emisión: ${liquidation.date}`, pageWidth - 14, 19, { align: 'right' });

  currentY = 38;

  // Barber and Settlement Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setTextColor(1, 29, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL BARBERO Y LIQUIDACIÓN', 18, currentY + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  doc.text(`Barbero: `, 18, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(liquidation.barberName, 35, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Teléfono / WhatsApp: `, 18, currentY + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(liquidation.barberPhone || 'No registrado', 52, currentY + 21);

  doc.setFont('helvetica', 'normal');
  doc.text(`Método de Pago: `, 110, currentY + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(liquidation.paymentMethod.toUpperCase(), 138, currentY + 14);

  doc.setFont('helvetica', 'normal');
  doc.text(`Servicios Registrados: `, 110, currentY + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(`${liquidation.totalServicesCount} servicios liquidados`, 146, currentY + 21);

  currentY += 34;

  // Detailed Table Header
  doc.setFillColor(1, 29, 50);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.rect(14, currentY, pageWidth - 28, 7, 'F');
  doc.text('FECHA', 18, currentY + 5);
  doc.text('FACTURA', 42, currentY + 5);
  doc.text('CLIENTE / SERVICIO', 70, currentY + 5);
  doc.text('TOTAL SERVICIO', 140, currentY + 5, { align: 'right' });
  doc.text('COMISIÓN (50%)', pageWidth - 18, currentY + 5, { align: 'right' });

  currentY += 8;

  // Render sales rows (up to 12 rows, then summarized)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  const displaySales = salesList.slice(0, 10);
  if (displaySales.length > 0) {
    displaySales.forEach((sale, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY - 1, pageWidth - 28, 6.5, 'F');
      }

      const servicesNames = sale.selectedServices.map(s => s.name).join(', ') || 'Servicio de Barbería';
      const truncatedServices = servicesNames.length > 34 ? servicesNames.substring(0, 31) + '...' : servicesNames;
      const clientLabel = sale.clientName ? `${sale.clientName} - ` : '';

      doc.text(sale.date.split(' ')[0] || sale.date, 18, currentY + 3.5);
      doc.text(sale.invoiceNumber, 42, currentY + 3.5);
      doc.text(`${clientLabel}${truncatedServices}`, 70, currentY + 3.5);
      doc.text(`$${sale.total.toLocaleString('es-CO')}`, 140, currentY + 3.5, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(197, 160, 89);
      doc.text(`$${sale.barberCommission.toLocaleString('es-CO')}`, pageWidth - 18, currentY + 3.5, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);

      currentY += 6.5;
    });

    if (salesList.length > 10) {
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text(`... y ${salesList.length - 10} servicios adicionales registrados en este corte`, 18, currentY + 3.5);
      currentY += 6;
    }
  } else {
    doc.text('Liquidación general consolidada según registros del sistema POS.', 18, currentY + 3.5);
    currentY += 8;
  }

  currentY += 4;

  // Financial Summary Card
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - 95, currentY, 81, 30, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Comisiones Brutas Acumuladas:', pageWidth - 90, currentY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`$${liquidation.totalEarnedCommission.toLocaleString('es-CO')}`, pageWidth - 18, currentY + 6, { align: 'right' });

  if (liquidation.deductionAmount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(225, 29, 72);
    doc.text(`Deducción / Anticipos (${liquidation.deductionReason || 'Otros'}):`, pageWidth - 90, currentY + 12);
    doc.setFont('helvetica', 'bold');
    doc.text(`-$${liquidation.deductionAmount.toLocaleString('es-CO')}`, pageWidth - 18, currentY + 12, { align: 'right' });
  }

  doc.setDrawColor(197, 160, 89);
  doc.line(pageWidth - 90, currentY + 17, pageWidth - 18, currentY + 17);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(1, 29, 50);
  doc.text('TOTAL NETO PAGADO:', pageWidth - 90, currentY + 24);
  doc.setFontSize(12);
  doc.setTextColor(197, 160, 89);
  doc.text(`$${liquidation.netPaidAmount.toLocaleString('es-CO')} COP`, pageWidth - 18, currentY + 24, { align: 'right' });

  currentY += 38;

  // Legal Declaration of Satisfaction & Receipt
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  const legalText =
    'DECLARACIÓN A CONFORMIDAD: El suscrito barbero declara haber recibido a su entera y cabal satisfacción el valor neto liquidado correspondiente al porcentaje pactado por sus servicios prestados en las instalaciones de LEGADO BARBER CLUB, de conformidad con el contrato de arrendamiento de puesto de trabajo, encontrándose a la fecha a paz y salvo por todo concepto económico derivado de dicho período.';
  const splitLegal = doc.splitTextToSize(legalText, pageWidth - 28);
  doc.text(splitLegal, 14, currentY);

  currentY += 14;

  // Digital Signatures Box
  const sigBoxWidth = (pageWidth - 34) / 2;
  const sigBoxHeight = 32;

  // Admin Signature Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(1, 29, 50);
  doc.text('ADMINISTRACIÓN / LEGADO BARBER CLUB', 18, currentY + 6);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Autorizado y Pagado', 18, currentY + 10);

  if (liquidation.adminSignature) {
    try {
      doc.addImage(liquidation.adminSignature, 'PNG', 18, currentY + 11, sigBoxWidth - 10, 16);
    } catch (e) {
      console.warn('Error embedding admin signature:', e);
    }
  }

  // Barber Signature Box
  doc.roundedRect(14 + sigBoxWidth + 6, currentY, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(1, 29, 50);
  doc.text(`RECIBIDO A CONFORMIDAD: ${liquidation.barberName.toUpperCase()}`, 14 + sigBoxWidth + 10, currentY + 6);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Firma Digital del Barbero', 14 + sigBoxWidth + 10, currentY + 10);

  if (liquidation.barberSignature) {
    try {
      doc.addImage(liquidation.barberSignature, 'PNG', 14 + sigBoxWidth + 10, currentY + 11, sigBoxWidth - 10, 16);
    } catch (e) {
      console.warn('Error embedding barber signature:', e);
    }
  }

  // Footer stamp
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Documento electrónico generado por el Sistema Legado Barber Club • Comprobante ${liquidation.voucherNumber}`,
    pageWidth / 2,
    290,
    { align: 'center' }
  );

  // Download PDF
  const filename = `Liquidacion_${liquidation.barberName.replace(/\s+/g, '_')}_${liquidation.voucherNumber}.pdf`;
  doc.save(filename);
};

export const generateContractPDF = (contract: BarberContract): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 15;

  // Header Banner
  doc.setFillColor(1, 29, 50);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setFillColor(197, 160, 89);
  doc.rect(0, 26, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LEGADO BARBER CLUB', 14, 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(197, 160, 89);
  doc.text('CONTRATO CIVIL Y COMERCIAL DE ARRENDAMIENTO DE PUESTO DE TRABAJO (MÓDULO)', 14, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`CONTRATO N°: ${contract.contractNumber}`, pageWidth - 14, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Inicio: ${contract.startDate}`, pageWidth - 14, 18, { align: 'right' });

  currentY = 34;

  const addClause = (title: string, bodyText: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(1, 29, 50);
    doc.text(title, 14, currentY);
    currentY += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitLines = doc.splitTextToSize(bodyText, pageWidth - 28);
    doc.text(splitLines, 14, currentY);
    currentY += splitLines.length * 3.6 + 3.5;
  };

  addClause(
    'PARTES INTERVINIENTES',
    `De una parte, LEGADO BARBER CLUB (en adelante EL ARRENDADOR/ESTABLECIMIENTO), y de otra parte el(la) señor(a) ${contract.barberName.toUpperCase()}, identificado(a) con C.C. N° ${contract.barberCedula}, teléfono ${contract.barberPhone}, domiciliado(a) en ${contract.barberAddress || 'la ciudad de operación'} (en adelante EL BARBERO/ARRENDATARIO), han convenido celebrar el presente contrato regido por las siguientes cláusulas:`
  );

  addClause(
    'CLÁUSULA PRIMERA: NATURALEZA Y OBJETO DEL CONTRATO',
    'El presente contrato es de naturaleza estrictamente civil y comercial al tenor del artículo 1973 y concordantes del Código Civil y Código de Comercio. El ARRENDADOR cede el uso temporal de un módulo o puesto de trabajo físico de barbería al BARBERO, a cambio de una contraprestación basada en un porcentaje sobre el valor de cada servicio realizado. Las partes declaran expresamente la INEXISTENCIA DE RELACIÓN O SUBORDINACIÓN LABORAL, gozando el BARBERO de plena autonomía técnica, artística y directiva en la ejecución de sus servicios.'
  );

  addClause(
    'CLÁUSULA SEGUNDA: APORTES Y DOTACIÓN A CARGO DE LEGADO BARBER CLUB',
    'EL ARRENDADOR pone a disposición del BARBERO para el óptimo desempeño del servicio: (a) Espacio físico adecuado, iluminado y climatizado; (b) Servicios públicos continuos incluidos (Internet de alta velocidad WiFi, fluido eléctrico ininterrumpido y agua corriente potable); (c) Estación de lavacabezas profesional dotada permanentemente de jabón, champú y productos acondicionadores; (d) Dotación continua de toallas limpias, desinfectadas y esterilizadas; (e) Uniformes corporativos y capas de corte distintivas de la marca; (f) Silla hidráulica reclinable y espejo profesional.'
  );

  addClause(
    'CLÁUSULA TERCERA: APORTES Y HERRAMIENTAS A CARGO DEL BARBERO',
    'EL BARBERO aporta exclusivamente su talento personal, destreza artística y técnica. Asimismo, es obligación estricta del BARBERO aportar y mantener en óptimas condiciones mecánicas e higiénicas sus propias herramientas de trabajo: máquinas de corte (clippers), patilleras (trimmers), shavers, tijeras, navajines portacuchillas, peines, secador, cepillos y demás indumentaria personal requerida para su ejercicio.'
  );

  addClause(
    'CLÁUSULA CUARTA: RESPONSABILIDAD ESTRICTA DE LIMPIEZA Y DESINFECCIÓN',
    'Es OBLIGACIÓN DIRECTA, INELUDIBLE Y PRIORITARIA del BARBERO realizar la limpieza integral, barrido de cabello, desinfección de superficies y ordenamiento de su puesto de trabajo INMEDIATAMENTE DESPUÉS DE CULMINAR CADA SERVICIO. La estación debe permanecer en impecables condiciones higiénicas para la recepción del siguiente usuario.'
  );

  addClause(
    'CLÁUSULA QUINTA: NORMAS SANITARIAS, BIOSEGURIDAD Y SEGURIDAD SOCIAL',
    'El BARBERO se obliga a acatar rigurosamente las normas de bioseguridad sanitaria (Resolución 2827 de 2006 y normas complementarias): uso exclusivo de cuchillas desechables de un solo uso por cliente descartadas en guardián cortopunzante, y desinfección bactericida de peines e instrumentos. Asimismo, como profesional independiente, EL BARBERO se compromete a mantener activa y al día su afiliación al Sistema de Seguridad Social Integral (Salud, Pensión y ARL como independiente), exonerando a LEGADO BARBER CLUB de responsabilidades derivadas de accidentes o enfermedades.'
  );

  addClause(
    'CLÁUSULA SEXTA: PORCENTAJE DE CONTRAPRESTACIÓN ECONÓMICA',
    `Por cada servicio facturado, se distribuirá el ${contract.percentageCut}% a favor de EL BARBERO por concepto de honorarios/participación y el restante ${100 - contract.percentageCut}% a favor de EL ESTABLECIMIENTO como canon de arrendamiento y compensación de infraestructura, insumos y servicios.`
  );

  addClause(
    'CLÁUSULA SÉPTIMA: PREAVISO OBLIGATORIO PARA ENTREGA DE PUESTO (20 DÍAS)',
    'Cualquiera de las partes podrá dar por terminado el presente contrato en cualquier momento. Sin embargo, para la entrega, desocupación o retiro voluntario del puesto de trabajo, EL BARBERO DEBERÁ NOTIFICAR POR ESCRITO A LA ADMINISTRACIÓN CON UN MÍNIMO DE VEINTE (20) DÍAS DE ANTELACIÓN, con el fin de garantizar la atención organizada de los clientes y la entrega formal y a satisfacción del módulo.'
  );

  // Digital Signatures
  currentY = Math.min(currentY, 240);
  const sigBoxWidth = (pageWidth - 34) / 2;
  const sigBoxHeight = 28;

  // Admin Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, currentY, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(1, 29, 50);
  doc.text('POR LEGADO BARBER CLUB', 18, currentY + 5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Administración / Arrendador', 18, currentY + 9);

  if (contract.adminSignature) {
    try {
      doc.addImage(contract.adminSignature, 'PNG', 18, currentY + 10, sigBoxWidth - 10, 14);
    } catch (e) {
      console.warn('Error embedding admin signature in contract:', e);
    }
  }

  // Barber Box
  doc.roundedRect(14 + sigBoxWidth + 6, currentY, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(1, 29, 50);
  doc.text(`POR EL BARBERO: ${contract.barberName.toUpperCase()}`, 14 + sigBoxWidth + 10, currentY + 5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`C.C. ${contract.barberCedula} • Arrendatario`, 14 + sigBoxWidth + 10, currentY + 9);

  if (contract.barberSignature) {
    try {
      doc.addImage(contract.barberSignature, 'PNG', 14 + sigBoxWidth + 10, currentY + 10, sigBoxWidth - 10, 14);
    } catch (e) {
      console.warn('Error embedding barber signature in contract:', e);
    }
  }

  // Save Contract
  const filename = `Contrato_LegadoBarber_${contract.barberName.replace(/\s+/g, '_')}_${contract.contractNumber}.pdf`;
  doc.save(filename);
};

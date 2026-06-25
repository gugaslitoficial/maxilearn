import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#fffdf9",
    padding: 0,
  },
  border: {
    margin: 28,
    border: "2pt solid #CC1F1F",
    borderRadius: 6,
    padding: "32pt 40pt",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  platformName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1a1414",
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 9,
    color: "#CC1F1F",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 24,
  },
  certifies: {
    fontSize: 11,
    color: "#8a7a5e",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  studentName: {
    fontSize: 30,
    fontFamily: "Helvetica-BoldOblique",
    color: "#16100f",
    marginBottom: 16,
  },
  description: {
    fontSize: 12,
    color: "#5a5044",
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: 380,
    marginBottom: 28,
  },
  courseName: {
    fontFamily: "Helvetica-Bold",
    color: "#16100f",
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: "#e0d3b8",
  },
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 28,
    paddingHorizontal: 20,
  },
  signatureBlock: {
    alignItems: "center",
    flex: 1,
  },
  signatureName: {
    fontSize: 14,
    fontFamily: "Helvetica-BoldOblique",
    color: "#16100f",
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#5a5044",
    letterSpacing: 0.5,
    borderTop: "1pt solid #cbbf9f",
    paddingTop: 5,
    width: 120,
    textAlign: "center",
  },
  signatureSub: {
    fontSize: 8,
    color: "#8a7a5e",
    marginTop: 2,
  },
  validationBadge: {
    marginTop: 24,
    backgroundColor: "#faf6ec",
    border: "1pt solid #e8ddc8",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  validationText: {
    fontSize: 9,
    color: "#5a5044",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
});

export interface CertPDFProps {
  studentName: string;
  courseName: string;
  teacherName: string;
  issuedAt: string;
  validationCode: string;
  companyName: string;
  courseDuration?: string | null;
}

function formatDatePt(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CertificatePDF({
  studentName,
  courseName,
  teacherName,
  issuedAt,
  validationCode,
  companyName,
  courseDuration,
}: CertPDFProps) {
  return (
    <Document title={`Certificado - ${courseName}`} author={companyName}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.platformName}>{companyName}</Text>
          <Text style={styles.subtitle}>Certificado de Conclusão</Text>

          <Text style={styles.certifies}>Certificamos que</Text>
          <Text style={styles.studentName}>{studentName}</Text>

          <Text style={styles.description}>
            {"concluiu com êxito o curso "}
            <Text style={styles.courseName}>{courseName}</Text>
            {courseDuration ? `, com carga horária de ${courseDuration}` : ""}
            {", cumprindo todos os requisitos exigidos."}
          </Text>

          <View style={styles.signaturesRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureName}>{teacherName}</Text>
              <Text style={styles.signatureLabel}>{teacherName}</Text>
              <Text style={styles.signatureSub}>Instrutor responsável</Text>
            </View>
            <View style={[styles.signatureBlock, { alignItems: "center" }]}>
              <View style={[styles.divider, { marginBottom: 6 }]} />
              <Text style={[styles.signatureLabel, { border: "none", paddingTop: 0 }]}>
                {formatDatePt(issuedAt)}
              </Text>
              <Text style={styles.signatureSub}>Data de conclusão</Text>
            </View>
          </View>

          <View style={styles.validationBadge}>
            <Text style={styles.validationText}>CÓDIGO DE VALIDAÇÃO: {validationCode}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

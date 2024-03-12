import type { Database } from "@carbon/database";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

import type { PDF } from "../types";
// import { getLineDescription } from "../utils/quote";
import { Header, Summary, Template } from "./components";

interface QuotePDFProps extends PDF {
  quote: Database["public"]["Views"]["quotes"]["Row"];
  quoteLines: Database["public"]["Tables"]["quoteLine"]["Row"][];
}

const QuotePDF = ({
  company,
  meta,
  quote,
  quoteLines,
  title = "Quote",
}: QuotePDFProps) => {
  return (
    <Template
      title={title}
      meta={{
        author: meta?.author ?? "Carbon ERP",
        keywords: meta?.keywords ?? "Quote",
        subject: meta?.subject ?? "Quote",
      }}
    >
      <View>
        <Header title={title} company={company} />
        <Summary
          company={company}
          items={[
            {
              label: "Date",
              value: quote?.quoteDate,
            },
            {
              label: "Quote #",
              value: quote?.quoteId,
            },
          ]}
        />
        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={styles.tableCol1}>Description</Text>
            <Text style={styles.tableCol2}>Qty</Text>
            <Text style={styles.tableCol3}>Price</Text>
            <Text style={styles.tableCol4}>Total</Text>
          </View>
          {quoteLines.map((line) => (
            <View style={styles.tr} key={line.id}>
              <Text key={line.id}>{line.description}</Text>
            </View>
          ))}
        </View>
        {quote.notes && (
          <View style={styles.row}>
            <View style={styles.colFull}>
              <Text style={styles.label}>Notes</Text>
              <Text>{quote.notes}</Text>
            </View>
          </View>
        )}
      </View>
    </Template>
  );
};

export default QuotePDF;

const styles = StyleSheet.create({
  row: {
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
  },
  colFull: {
    display: "flex",
    flexDirection: "column",
    rowGap: 3,
    fontSize: 11,
    fontWeight: 500,
    width: "100%",
  },
  colHalf: {
    display: "flex",
    flexDirection: "column",
    rowGap: 3,
    fontSize: 11,
    fontWeight: 500,
    width: "50%",
  },
  colThird: {
    display: "flex",
    flexDirection: "column",
    rowGap: 3,
    fontSize: 11,
    fontWeight: 500,
    width: "32%",
  },
  label: {
    color: "#7d7d7d",
  },
  bold: {
    fontWeight: 700,
    color: "#000000",
  },
  table: {
    marginBottom: 20,
    fontSize: 10,
  },
  thead: {
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    padding: "6px 3px 6px 3px",
    borderTop: 1,
    borderTopColor: "#CCCCCC",
    borderTopStyle: "solid",
    borderBottom: 1,
    borderBottomColor: "#CCCCCC",
    borderBottomStyle: "solid",
    fontWeight: 700,
    color: "#7d7d7d",
    textTransform: "uppercase",
  },
  tr: {
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "6px 3px 6px 3px",
    borderBottom: 1,
    borderBottomColor: "#CCCCCC",
  },
  tfoot: {
    flexGrow: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 3px 6px 3px",
    borderTopStyle: "solid",
    borderBottom: 1,
    borderBottomColor: "#CCCCCC",
    borderBottomStyle: "solid",
    fontWeight: 700,
    color: "#7d7d7d",
    textTransform: "uppercase",
  },
  tableCol1: {
    width: "50%",
    textAlign: "left",
  },
  tableCol2: {
    width: "15%",
    textAlign: "right",
  },
  tableCol3: {
    width: "15%",
    textAlign: "right",
  },
  tableCol4: {
    width: "20%",
    textAlign: "right",
  },
});

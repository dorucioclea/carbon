import type { Database } from "@carbon/database";
import { StyleSheet, Text, View } from "@react-pdf/renderer";

import type { PDF } from "../types";
import { QuoteSummary, Template, QuoteHeader } from "./components";
import { getExtendedPrice, getUnitCost } from "../utils/quote";

interface QuotePDFProps extends PDF {
  quote: Database["public"]["Views"]["quotes"]["Row"];
  quoteLines: Database["public"]["Tables"]["quoteLine"]["Row"][];
  quoteLineQuantities:
    | Database["public"]["Tables"]["quoteLineQuantity"]["Row"][]
    | null;
  quoteCustomerDetails: Database["public"]["Views"]["quoteCustomerDetails"]["Row"];
}

const QuotePDF = ({
  company,
  meta,
  quote,
  quoteLines,
  quoteLineQuantities,
  quoteCustomerDetails,
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
        <QuoteHeader
          title={title}
          quoteNumber={quote.quoteId ? quote.quoteId : null}
          company={company}
        />
        <QuoteSummary
          company={company}
          quoteCustomerDetails={quoteCustomerDetails}
          items={[
            {
              label: "Date",
              value: quote?.quoteDate ? quote.quoteDate : null,
            },
          ]}
        />
        <View style={styles.table}>
          <View style={styles.thead}>
            <Text style={styles.tableCol1}>Description</Text>
            <Text style={styles.tableCol2}>Qty</Text>
            <Text style={styles.tableCol3}>Time</Text>
            <Text style={styles.tableCol4}>Cost</Text>
            <Text style={styles.tableCol5}>Total</Text>
          </View>
          {quoteLines.map((line) => (
            <View key={line.id} style={styles.tr}>
              <View style={styles.tableCol1}>
                <Text style={styles.bold}>{line.description}</Text>
                <Text style={{ fontSize: 9, opacity: 0.8 }}>{line.partId}</Text>
              </View>
              <View style={styles.quantityTable}>
                {quoteLineQuantities &&
                  quoteLineQuantities.map((quantity) =>
                    quantity.quoteLineId === line.id ? (
                      <View style={styles.quantityRow} key={quantity.id}>
                        <View style={styles.quantityCol1}>
                          <Text>{quantity.quantity}</Text>
                        </View>
                        <View style={styles.quantityCol2}>
                          <Text>{quantity.leadTime} d</Text>
                        </View>
                        <View style={styles.quantityCol3}>
                          <Text>{getUnitCost(quantity).toFixed(2)}</Text>
                        </View>
                        <View style={styles.quantityCol4}>
                          <Text>${getExtendedPrice(quantity).toFixed(2)}</Text>
                        </View>
                      </View>
                    ) : null
                  )}
              </View>
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
    width: "40%",
    textAlign: "left",
  },
  tableCol2: {
    width: "15%",
    textAlign: "left",
  },
  tableCol3: {
    width: "12.5%",
    textAlign: "left",
  },
  tableCol4: {
    width: "12.5%",
    textAlign: "left",
  },
  tableCol5: {
    width: "15%",
    textAlign: "right",
  },
  quantityTable: {
    width: "60%",
  },
  quantityRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "6px 3px 6px 3px",
  },
  quantityCol1: {
    width: "15%",
    textAlign: "left",
  },
  quantityCol2: {
    width: "12.5%",
    textAlign: "left",
  },
  quantityCol3: {
    width: "12.5%",
    textAlign: "left",
  },
  quantityCol4: {
    width: "20%",
    textAlign: "right",
  },
});

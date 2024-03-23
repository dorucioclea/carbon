import { Image, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Company } from "../../types";

type HeaderProps = {
  company: Company;
  quoteNumber?: string | null;
  title: string;
};

const styles = StyleSheet.create({
  header: {
    fontSize: 11,
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    height: 70,
  },
  logo: {
    height: 70,
  },
  title: {
    fontSize: 18,
    letterSpacing: -1,
    fontWeight: 500,
  },
});

const QuoteHeader = ({ title, quoteNumber, company }: HeaderProps) => {
  return (
    <View style={styles.header}>
      <View>
        {company.logo && (
          <View>
            <Image src={company.logo} style={styles.logo} />
          </View>
        )}
      </View>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text>{quoteNumber}</Text>
      </View>
    </View>
  );
};

export default QuoteHeader;

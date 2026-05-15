import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  header: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 10 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingVertical: 5 },
  label: { width: 100, fontWeight: 'bold' },
  value: { flex: 1 },
  footer: { marginTop: 30, textAlign: 'center', color: '#888' }
});

export const InvoicePDF = ({ order }: { order: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>INVOICE</Text>
      
      <View style={styles.section}>
        <View style={styles.row}><Text style={styles.label}>Order #:</Text><Text style={styles.value}>{order.orderNumber}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Date:</Text><Text style={styles.value}>{new Date(order.createdAt).toLocaleDateString()}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Customer:</Text><Text style={styles.value}>{order.user.name}</Text></View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Order Items:</Text>
        {order.items.map((item: any, i: number) => (
          <View key={i} style={styles.row}>
            <Text style={{ flex: 2 }}>{item.name}</Text>
            <Text style={{ flex: 1 }}>{item.quantity} x ${item.price}</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>${(item.quantity * item.price).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 20, textAlign: 'right' }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Total: ${order.total.toFixed(2)}</Text>
      </View>

      <Text style={styles.footer}>Thank you for your business!</Text>
    </Page>
  </Document>
);

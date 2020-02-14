import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;

public class Main {
    private static ObjectMapper mapper=new ObjectMapper();
    public static void main(String[] args) {
        String excelAddress= "E:\\bussineses\\stationary\\catalogue\\photoshop\\catalog.xlsx";
        String tableName="products";
        String sheetName= "products";
        String destinationJson="E:\\bussineses\\stationary\\catalogue\\photoshop\\productsJson\\products.txt";

        try {
            //String res= objectMapper.writeValueAsString(orders);
            // orders.forEach(a-> System.out.println(a.getDate()));
            //System.out.println(res);
            ExcelUtil excelFile= ExcelUtil.getExcelUtil(excelAddress);

            Map<String, JsonNode> map= excelFile.convertStationaryTable(sheetName);
            JsonNode res= map.get(tableName);
            String prettyFormat = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(res);
            Files.write(Paths.get(destinationJson), prettyFormat.getBytes());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.gson.JsonArray;
import org.apache.poi.xssf.usermodel.*;
import org.openxmlformats.schemas.spreadsheetml.x2006.main.CTTable;

import java.io.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
    singletone class
 */
public class ExcelUtil {
    private static String address;
    private static ExcelUtil sync=new ExcelUtil("aa");
    private static volatile ExcelUtil instance;
    private ExcelUtil(String address){
        this.address =  address;
    }
    public static ExcelUtil getExcelUtil(String address){
        if(instance == null){
            synchronized (sync){
                if(instance ==null){
                    return new ExcelUtil(address);
                }else return instance;
            }
        }else{
            return instance;
        }
    }

    /** returns all the tables inside this sheet in an map */
    public Map<String,JsonNode> convertStationaryTable(String sheetName){
        XSSFWorkbook workbook=openWorkbook();
        XSSFSheet sheet=workbook.getSheet(sheetName); //1
        List<XSSFTable> tables=sheet.getTables();
        Map<String, List<List<String>>> tablesInMap= new HashMap<>();

        tables.forEach(tbl->{
            int startRow=tbl.getStartRowIndex();
            int endRow = tbl.getEndRowIndex();
            int startCol= tbl.getStartColIndex();
            int endCol= tbl.getEndColIndex();
            List<List<String>> tableInlist= new ArrayList<>();
            for (int row = startRow; row <= endRow ; row++) {
                List<String> rowInList= new ArrayList<>();
                for (int col = startCol; col <=endCol ; col++) {
                    XSSFCell cell=sheet.getRow(row).getCell(col);
                    if(cell ==null){
                        rowInList.add("-");
                        continue;
                    }
                    switch (cell.getCellType()){
                        case STRING:
                            rowInList.add(cell.getStringCellValue());
                            break;
                        case NUMERIC:
                            rowInList.add(Long.toString(new Double(Math.round(cell.getNumericCellValue())).longValue()));
                            break;
                        case BOOLEAN: rowInList.add(Boolean.toString(cell.getBooleanCellValue()));
                            break;
                        case FORMULA: rowInList.add(cell.getStringCellValue());
                            break;
                        default: rowInList.add("*****");
                    }
                }
                tableInlist.add(rowInList);
            }
            tablesInMap.put(tbl.getName(), tableInlist);
        });

        Map<String ,JsonNode> jsonTables=new HashMap<>();
        tablesInMap.forEach((k,v) -> jsonTables.put(k, toJsonTree(v)));
       /* try {
            workbook.close();
        } catch (IOException e) {
            e.printStackTrace();
        }*/
        return jsonTables;
    }

    public String convertToJson(JsonNode jsonNode) throws JsonProcessingException {
        ObjectMapper mapper= new ObjectMapper();
        return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonNode);
    }



    private XSSFWorkbook openWorkbook()  {
        XSSFWorkbook workbook=null;
        ClassLoader classLoader=getClass().getClassLoader();

        String excelAddress=this.address;
        try {
            FileInputStream fileInputStream=new FileInputStream(new File(excelAddress));
            workbook=new XSSFWorkbook( fileInputStream);

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return workbook;
    }

    private JsonNode toJsonTree(List<List<String>> list){
        ObjectMapper mapper=new ObjectMapper();
        ArrayNode rootNode= mapper.createArrayNode();
        ArrayNode secondNode= mapper.createArrayNode();
        rootNode.add(secondNode);
        int innerCounter=0;
        for(int i=1; i<list.size(); i++){
           // String nodeKey= list.get(i).get(0);
            ObjectNode node= mapper.createObjectNode();
            for(int j=0; j< list.get(0).size(); j++){
                node.put(list.get(0).get(j), list.get(i).get(j));
            }
            if(i == 1){
                ((ArrayNode)rootNode.get(0)).add(node);
            }else{
                ArrayNode innerNode= (ArrayNode) rootNode.get(innerCounter);
                if(innerNode.get(innerNode.size()-1).get("code").equals(node.get("code"))){
                    ((ArrayNode)rootNode.get(innerCounter)).add(node);
                }else{
                    rootNode.add(mapper.createArrayNode());
                    innerCounter++;
                    ((ArrayNode)rootNode.get(innerCounter)).add(node);
                }

            }

          /*
            if(rootNode.get(i-1) != null){
                int id = rootNode.get(nodeKey).size();
                ((ObjectNode)rootNode.get(nodeKey)).set(Integer.toString(id+1),node);
            }else{
               // ((ObjectNode) rootNode).putObject(nodeKey).set("1", node);
            }*/
        }
        //System.out.println(rootNode);
        return rootNode;
    }
}

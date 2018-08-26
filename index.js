const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Which Deparment would you like to chose? ', (deparmentID) => {
  // TODO: Log the answer in a database
  console.log(`Deparment: ${deparmentID}`);

  var fs = require('fs');

function csvJSON(csv){

  var lines=csv.split("\n");

  var result = [];

  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){

	  var obj = {};
	  var currentline=lines[i].split(",");

	  for(var j=0;j<headers.length;j++){
		  obj[headers[j]] = currentline[j];
	  }

	  result.push(obj);

  }
  
  //return result; //JavaScript object
  return result; //JSON
}
 
fs.readFile('WaterUsageSample.csv', 'utf8', function(err, contents) {
    // console.log(contents);
    const departmentData = csvJSON(contents);
    // need input from Bash
    const deparment = departmentData.filter((data) => {
      return data.DepartmentId === deparmentID;
    });
    
    const mappedData = deparment.map((data) => {
      return {
        id: data.DepartmentId,
        date:  (data.Date),
        volume: Number(data['Volume\r'].replace('\r', '')),
      };
    });    

    const sortmounth = mappedData.sort((a,b) =>  a.date > b.date ? 1:-1);
    const sortday = sortmounth.sort((a,b) =>  a.date > b.date ? 1:-1);

    let uniquedates = [];

    sortday.forEach((data) => {uniquedates.push(data.date)}); 
    uniquedates = [...new Set(uniquedates)];
     
    let i = 0;
    let volumetotals = [];

    while (i < sortday.length-1){
      total = sortday[i].volume;      
      j = 1;
      while(sortday[i].date === sortday[i+j].date){
        total = total + sortday[i + j].volume;
        j++;
        if ((i + j) >=  sortday.length){
          break;
        }        
      }      
      volumetotals.push(total);
      i = i + j;      
    }
    
    if (sortday[sortday.length - 1].date === sortday[sortday.length - 2].date){
      volumetotals[sortday.length - 1] += sortday[sortday.length - 1].volume;
    } 
    else {
      volumetotals.push(sortday[sortday.length - 1].volume)
    }
    
    let id = Array(volumetotals.length).fill(deparmentID);


    function arraymerger(idArray, dateArray, volumeArray){
      let result =[];
      for (var i = 0; i < volumetotals.length; i++){
        result.push({id: idArray[i],date: dateArray[i], volume: volumeArray[i]});
      }
      return result;
    }

    const result = arraymerger(id, uniquedates, volumetotals);
    console.log("")
    console.log("Average daily consumption for department " + deparmentID+":");    
    console.log(result); 
    console.log("");

    let dates = ['2017-01','2017-02','2017-03','2017-04','2017-05','2017-06','2017-07','2017-08','2017-09','2017-10','2017-11','2017-12'];
    let p = 0;
    let sum = 0;
    let tem = 0;    
    let average = [];    

    for (let i = 0; i < 12; i++ ){
      while ((p+tem) < result.length){
        if (result[p+tem].date.includes(dates[i]) === true){
          sum += result[p+tem].volume;          
          p++;        
        } 
        else {
          tem += p;
          break;                  
        }
      }
      average.push(sum/p);
      p = 0;
      sum = 0;    
    }   

    let month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    let id2 = Array(average.length).fill(deparmentID);
    
    function arraymerger2(idArray, MArray, AArray){
      let result2 =[];
      for (let i = 0; i < average.length; i++){
        result2.push({id: idArray[i],month: MArray[i], average: AArray[i]});
      }
      return result2;
    }

    const result2 = arraymerger2(id2, month, average); 
    console.log("Average monthly consumption for department " + deparmentID+":");       
    console.log(result2);
    console.log("") 
    
    //Create and Append Data to csv File

    var csv = require('fast-csv');

    var csvStream = csv.createWriteStream({ headers: true }),
        writableStream = fs.createWriteStream(`department-${deparmentID}-daily-consumption.csv`);

    writableStream.on("finish", function () {
        //console.log("DONE!");
    });

    csvStream.pipe(writableStream);
    result2.forEach((row) => {
      const average = String(row.average);
      csvStream.write({
        deparment: row.id,
        month: row.month,
        average: average,
      });
    });
    csvStream.end();  

    var csvStream = csv.createWriteStream({ headers: true }),
        writableStream = fs.createWriteStream(`department-${deparmentID}-montthly-consumption.csv`);

    writableStream.on("finish", function () {
        console.log("Two new files have been created with all the relevant data with the same directory.");
    });

    csvStream.pipe(writableStream);
    result.forEach((row) => {
      const average = String(row.average);
      csvStream.write({
        deparment: row.id,
        date: row.date,
        totalvolume: row.volume,
      });
    });
    csvStream.end();          
});
  rl.close();
});

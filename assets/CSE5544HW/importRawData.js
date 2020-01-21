//Import and Refine Patient ID Information
var PatientIDs;

d3.csv("PatientIDCounts.csv").get(function(error, data)
    {
        data.sort(function(a,b) { return -a.PatientID - -b.PatientID })

        PatientIDs = data.map(function(d) {
            return {
              PatientID: d.PatientID,
            }
          });
    }
)

//Import and Refine Electronic Health Record Data

d3.csv("EHRdataSample.csv").get(function(error, data)
    {
        data.sort(function(a,b) { return (+a.PatientID - +b.PatientID) && (+a.Days_From1stTBI - +b.Days_From1stTBI) });

        var RelevantData = data.map(function(d) {
            return {
              ID: d.PatientID,
              Gender: d.Gender,
              DaysFrom1stTBI: d.Days_From1stTBI,
              Depr: d.Depression,
              PTSD: d.PTSD,
              Sleep: d.Sleep
            }
          });

          var MaleData = RelevantData.filter(function(d) {return d.Gender == "MALE"});
          var FemaleData = RelevantData.filter(function(d) {return d.Gender == "FEMALE"});
        
          generatePoints(MaleData, FemaleData, PatientIDs);
    }
)


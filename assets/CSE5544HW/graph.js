var gender = 1;
var XAxis = [];
var MaleFrequency = [];
var FemaleFrequency = [];

function generatePoints(MaleData, FemaleData, PatientIDs)
{
    var iteration = 0;
    var minDay = getMinDay(MaleData, FemaleData);
    var maxDay = getMaxDay(MaleData, FemaleData);


    for(i = minDay; i < maxDay; i = i +100)
    {
        XAxis[iteration] = i;

        MaleFrequency[iteration]=0;
        FemaleFrequency[iteration]=0;

        for(j = 0; j<PatientIDs.length; j++)
        {
            for(k=0; k<MaleData.length; k++)
            {
                var Record = MaleData[k];
                
                if(Record.ID == PatientIDs[j].PatientID && Record.DaysFrom1stTBI>i && Record.DaysFrom1stTBI<i+100)
                {
                    MaleFrequency[iteration]+=1;
                }
            }

            for(k=0; k<FemaleData.length; k++)
            {
                var Record = FemaleData[k];
                
                if(Record.ID == PatientIDs[j].PatientID && Record.DaysFrom1stTBI>i && Record.DaysFrom1stTBI<i+100)
                {
                    FemaleFrequency[iteration]+=1;
                }
            }
        }
        iteration++;
    }
    graphFrequency(gender, XAxis, MaleFrequency, FemaleFrequency);
}

function getMinDay(MaleData, FemaleData)
{
    return Math.min(MaleData[0].DaysFrom1stTBI, FemaleData[0].DaysFrom1stTBI);
}

function getMaxDay(MaleData, FemaleData)
{
    return Math.max(MaleData[MaleData.length-1].DaysFrom1stTBI, FemaleData[FemaleData.length-1].DaysFrom1stTBI);
}

function switchGenders()
{
    gender++;
    graphFrequency(gender, XAxis, MaleFrequency, FemaleFrequency);
}

function graphFrequency(gender, XAxis, MaleFrequency, FemaleFrequency)
{
    var svg = d3.select("svg");

    var marginX = 100;
    var marginY=450;
    var padding = 5;
    var barWidth = 10;

    svg.selectAll("*").remove();

    if(gender%2==1) //MALE
    {
        //Rectangles
        svg.selectAll("rect")
        .data(MaleFrequency)
        .enter()
        .append("rect")
        .attr("x", function(d,i)
        {
            return 4 + marginX + i * (barWidth + padding);
        })
        .attr('y', function(d){ return (marginY - parseInt(d)); })
        .attr("width", barWidth)
        .attr("height", function(d,i)
        {
            return d;
        })
        .style("fill", "steelblue");

        //YAxis
        Yscale = d3.scaleLinear()
        .domain([0, d3.max(MaleFrequency)])
        .range([marginY, marginY-d3.max(MaleFrequency)]);

        var yaxis = d3.axisLeft().scale(Yscale);
        svg.append("g").attr("transform", "translate(100, 0)").call(yaxis);

        //YAxis Label
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("x",-275)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Male Visits");      

        //Title
        svg.append("text")             
            .attr("transform",
            "translate(500,50)")
            .style("text-anchor", "middle")
            .text("Male Visit Distribution");
    }
    else //FEMALE
    { 
        //Rectangles
        svg.selectAll("rect")
        .data(FemaleFrequency)
        .enter()
        .append("rect")
        .attr("x", function(d,i)
        {
            return 4 + marginX + i * (barWidth + padding);
        })
        .attr('y', function(d){ return (marginY - parseInt(d)); })
        .attr("width", barWidth)
        .attr("height", function(d,i)
        {
            return d;
        })
        .style("fill", "red");

        //YAxis
        Yscale = d3.scaleLinear()
        .domain([0, d3.max(FemaleFrequency)])
        .range([marginY, marginY-d3.max(FemaleFrequency)]);
        var yaxis = d3.axisLeft().scale(Yscale);
        svg.append("g").attr("transform", "translate(100, 0)").call(yaxis);

        //YAxis Label
        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40)
        .attr("x",-400)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Female Visits"); 
            
        //Title
        svg.append("text")             
        .attr("transform",
        "translate(500,50)")
        .style("text-anchor", "middle")
        .text("Female Visit Distribution");
    }

    //XAxis
    var Xscale = d3.scaleLinear()
                    .domain([d3.min(XAxis), d3.max(XAxis)])
                    .range([marginX, marginX + (MaleFrequency.length) * (barWidth + padding)]);
    var xaxis = d3.axisBottom().scale(Xscale);
    svg.append("g").attr("transform", "translate(0, 450)").call(xaxis);

    //XAxis Label
    svg.append("text")             
    .attr("transform",
        "translate(515,500)")
    .style("text-anchor", "middle")
    .text("Days Before 1st Traumatic Brain Injury");
}

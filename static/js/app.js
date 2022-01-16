function init() {
    // Get the data
    d3.json("./data/samples.json").then((data) => {
      console.log(data);
  
        // Grab values from the data json object to build the plots
        var names = data.names;
        var metadata = data.metadata;
        var samples = data.samples;
  
        // Setting the page to open using the first test subject id
        var defaultID = names[0];
    
        // Build Test Subject dropdown
        var dropdownList = d3.selectAll("#selDataset")
          .selectAll("option")
          .data(names)
          .enter()
          .append("option")
          .attr("value", d => d)
          .text(d => d);
  
        // Populate Demographic Table
        // Loop through the metadata and return just the row matching the dropdown value
        var washFreq;
        metadata.forEach(row => {
          if (row.id === parseInt(defaultID)) {
              washFreq = row.wfreq; // use this in the Gauge Chart
              var sampleDiv = d3.selectAll("#sample-metadata")
              var ulTag = sampleDiv.append("ul");
                Object.entries(row).forEach(([key, value]) =>
                  ulTag.append("li").text(`${key}: ${value}`) 
                );
            }
        });
       
        // Horizontal Bar plot
        // Get x axis data
        var sampleValues = samples[0].sample_values
          // Sort values in descending order
          .sort((a, b) => b - a)
          // Get the top 10 highest values
          .slice(0, 10)
          // Reverse the order so they get plotted correctly 
          .reverse();
  
        // Get the y axis data
        // Create a new array that concatenates OTU to the beginning of each otu_id
        var otuLabels = samples[0].otu_ids.map(d => `OTU ${d}`)
          // Get the first 10
          .slice(0,10)
          // Reverse the order for plotting
          .reverse();
  
        // Hovertext
        var otuHover = samples[0].otu_labels.slice(0,10).reverse();
  
        var layout = {
          title: 'Top 10 OTUs',
          yaxis: {
            autorange: true,
          },
          xaxis: {
            autorange: true,
          },
        };
  
        // Create the trace including orientation so the bar chart is horizontal
        var trace1 = {
          type: 'bar',
          x: sampleValues,
          y: otuLabels,
          text: otuHover,
          orientation: 'h'
        };
        
        var data = [trace1];
  
        // Create the bar plot
        Plotly.newPlot("bar", data, layout);
  
  
        // Bubble Plot
        // Get x values
        var otuidBB = samples[0].otu_ids
  
        // Get y values
        var sampleBB = samples[0].sample_values
  
        // Get text values
        var otulabelsBB = samples[0].otu_labels
  
        var trace = {
          type: "scatter", 
          x: otuidBB,
          y: sampleBB,
          text: otulabelsBB,
          mode: 'markers',
          marker: {
            color: otuidBB,
            size: sampleBB,
            colorscale: "Portland"
          }
        };
        
        var data = [trace];
        
        var layout = {
          title: 'Prevalence of Microbes',
          xaxis: {title: {
            text: "OTU ID"}
            },
          showlegend: false,
          height: 600,
          width: 1200
        };
        
        Plotly.newPlot('bubble', data, layout);
  
  
        // Gauge Chart
        // Got most of this code from https://com2m.de/blog/technology/gauge-charts-with-plotly/
        // With some additional help from https://stackoverflow.com/questions/53211506/calculating-adjusting-the-needle-in-gauge-chart-plotly-js
  
        var level = washFreq;
  
        // Trig to calc meter point
        var degrees = 180 - (level * 20), //multiplying by 20 because the wash frequencies are not in degrees
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);
        var path1 = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L ' : 'M -0.025 -0.0 L 0.025 0.0 L ';
        // Path: may have to change to create a better triangle
        var mainPath = path1,
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);
  
        var data = [{ type: 'scatter',
          x: [0], y:[0],
            marker: {size: 14, color:'850000'},
            showlegend: false,
            text: level,
            hoverinfo: 'text'},
          { values: [81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81],
          rotation: 90,
          text: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', ''],
          direction: 'clockwise',
          textinfo: 'text',
          textposition:'inside',
          marker: {colors:['EDFAFD', 'CAF0F8', 'ADE8F4', '90E0EF', '48CAE4', '00B4D8','0096C7', '0077B6',
          '023E8A', '023E8A', '03045E)'
        ]},
          hoverinfo: 'label',
          hole: .4,
          type: 'pie',
          showlegend: false
        }];
  
        var layout = {
          shapes:[{
              type: 'path',
              path: path,
              fillcolor: '850000',
              line: {
                color: '850000'
              }
            }],
          title: { text: "Belly Button Washing Frequency<br><span style='font-size:0.8em;color:gray;'>Scrubs per Week</span><br><span style='font-size:1em;color:darkgray;font-weight: bold;'></span>"},
          height: 400,
          width: 400,
          xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
          yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
        };
  
        Plotly.newPlot('gauge', data, layout);
    });
  };
  
  function optionChanged() {
  
    // Get the data
    d3.json("./data/samples.json").then((data) => {
  
      // Grab values from the data json object to build the plots
      var metadata = data.metadata;
      var samples = data.samples;
  
      // Use D3 to select the dropdown menu and assign it to a variable
      var testSubject = d3.select("#selDataset").node().value;
  
      // Loop through the metadata and return just the row matching the dropdown value
      var washFreq;
      metadata.forEach(row => {
        if (row.id === parseInt(testSubject)) {
            washFreq = row.wfreq; // use this in the Gauge Chart
            var sampleDiv = d3.selectAll("#sample-metadata")
            // Clear out the previous test subject's data
            sampleDiv.html("");
            var ulTag = sampleDiv.append("ul");
              Object.entries(row).forEach(([key, value]) =>
                ulTag.append("li").text(`${key}: ${value}`) 
              );
          }
      });
  
      samples.forEach(sample => {
        if (sample.id === (testSubject)) {
  
        // Horizontal Bar plot
        var sampleValues = sample.sample_values
          // Sort values in descending order
          .sort((a, b) => b - a)
          // Get the top 10 highest values
          .slice(0, 10)
          // Reverse the order so they get plotted correctly 
          .reverse();
  
        // Get the y axis data
        // Create a new array that concatenates OTU to the beginning of each otu_id
        var otuLabels = sample.otu_ids.map(d => `OTU ${d}`)
          // Get the first 10
          .slice(0,10)
          // Reverse the order for plotting
          .reverse();
  
        // Hovertext
        var otuHover = sample.otu_labels.slice(0,10).reverse();
  
        var layout = {
          title: 'Top 10 OTUs',
          yaxis: {
              autorange: true,
          },
          xaxis: {
              autorange: true,
          },
        };
          // Create the trace including orientation so the bar chart is horizontal
          var trace1 = {
            type: 'bar',
            x: sampleValues,
            y: otuLabels,
            text: otuHover,
            orientation: 'h'
          };
          
          var data = [trace1];
  
          // Create the bar plot
          Plotly.newPlot("bar", data, layout);
  
  
      // Bubble Plot
          // Get x values
          var otuidBB = sample.otu_ids
  
          // Get y values
          var sampleBB = sample.sample_values
  
          // Get text values
          var otulabelsBB = sample.otu_labels
  
          var trace = {
            type: "scatter", 
            x: otuidBB,
            y: sampleBB,
            text: otulabelsBB,
            mode: 'markers',
            marker: {
              color: otuidBB,
              size: sampleBB,
              colorscale: "Portland"
            }
          };
          
          var data = [trace];
          
          var layout = {
            title: 'Prevalence of Microbes',
            xaxis: {title: {
              text: "OTU ID"}
              },
            showlegend: false,
            height: 600,
            width: 1200
          };
          
          Plotly.newPlot('bubble', data, layout);
        }
      });
  
      // Gauge Chart
      // Got most of this code from https://com2m.de/blog/technology/gauge-charts-with-plotly/
      // With some additional help from https://stackoverflow.com/questions/53211506/calculating-adjusting-the-needle-in-gauge-chart-plotly-js
  
      var level = washFreq;
  
      // Trig to calc meter point
      var degrees = 180 - (level * 20), //multiplying by 20 because the wash frequencies are not in degrees
          radius = .5;
      var radians = degrees * Math.PI / 180;
      var x = radius * Math.cos(radians);
      var y = radius * Math.sin(radians);
      var path1 = (degrees < 45 || degrees > 135) ? 'M -0.0 -0.025 L 0.0 0.025 L ' : 'M -0.025 -0.0 L 0.025 0.0 L ';
      // Path: may have to change to create a better triangle
      var mainPath = path1,
          pathX = String(x),
          space = ' ',
          pathY = String(y),
          pathEnd = ' Z';
      var path = mainPath.concat(pathX,space,pathY,pathEnd);
  
      var data = [{ type: 'scatter',
        x: [0], y:[0],
          marker: {size: 14, color:'850000'},
          showlegend: false,
          text: level,
          hoverinfo: 'text'},
        { values: [81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81/9, 81],
        rotation: 90,
        text: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', ''],
        direction: 'clockwise',
        textinfo: 'text',
        textposition:'inside',
        marker: {colors:['EDFAFD', 'CAF0F8', 'ADE8F4', '90E0EF', '48CAE4', '00B4D8','0096C7', '0077B6',
        '023E8A', '023E8A', '03045E)'
      ]},
        hoverinfo: 'label',
        hole: .4,
        type: 'pie',
        showlegend: false
      }];
  
      var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
              color: '850000'
            }
          }],
        title: { text: "Belly Button Washing Frequency<br><span style='font-size:0.8em;color:gray;'>Scrubs per Week</span><br><span style='font-size:1em;color:darkgray;font-weight: bold;'></span>"},
        height: 400,
        width: 400,
        xaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]}
      };
  
      Plotly.newPlot('gauge', data, layout);
  
    });
  };
  
  init();
    
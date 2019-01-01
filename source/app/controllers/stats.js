var Matches = [];

function LoadMatches() {

    var matchesString = LoadFile(GetBasePath() + "/../../mmrTracker.txt");
    matchesString.split("\n").slice(0, -1).map(x => Matches.push(JSON.parse(x)));
    console.log(Matches);

}

function GenerateChart() {

    var Lines = {
        "1v1": ["1v1"],
        "2v2": ["2v2"],
        "Solo 3v3": ["Solo 3v3"],
        "3v3": ["3v3"],
        "1v1x": ["1v1x"],
        "2v2x": ["2v2x"],
        "Solo 3v3x": ["Solo 3v3x"],
        "3v3x": ["3v3x"]
    };
    var LinesArray = [];

    for (var i = 0; i < Matches.length; i++) {
        var playlist = PlaylistIdToName(Matches[i].playlist)
        if (!Lines[playlist]) {
            Lines[playlist] = [];
            Lines[playlist].push(playlist);
        }
        Lines[playlist].push(Matches[i].skill);
        Lines[playlist + "x"].push(i);

    }

    for (var p in Lines) {
        LinesArray.push(Lines[p]);
    }

    console.log(LinesArray);

    var chart = c3.generate({
        bindto: "#chart",
        data: {
            xs: {
                '1v1': '1v1x',
                '2v2': '2v2x',
                'Solo 3v3': 'Solo 3v3x',
                '3v3': '3v3x'
            },
            columns: LinesArray,
            types: {
                "1v1": 'line',
                "2v2": 'line',
                "3v3": 'line',
                "Solo 3v3": 'line'
            }
        }
    });

}

LoadMatches();
GenerateChart();
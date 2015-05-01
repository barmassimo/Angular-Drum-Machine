"use strict";

minidm.controller("minidmCtrl", function ($scope, hotkeys) {
	
	// properties & configuration

	$scope.play = false;
	$scope.tempo = 120;
	$scope.currentTick = 0;
	
	$scope.filterFrequency = 5000;
	$scope.filterQ = 0;
	
	$scope.drumGrid = null;	
	
	$scope.drumSamples = [
	  {file: "./samples/bassdrum.wav",   name: "bassdrum",   fitlerFrequency: $scope.filterFrequency, filterQ: $scope.filterQ}, 
	  {file: "./samples/kickdrum.wav",   name: "kickdrum",   fitlerFrequency: $scope.filterFrequency, filterQ: $scope.filterQ}, 
	  {file: "./samples/snaredrum1.wav", name: "snaredrum1", fitlerFrequency: $scope.filterFrequency, filterQ: $scope.filterQ},
	  {file: "./samples/snaredrum2.wav", name: "snaredrum2", fitlerFrequency: $scope.filterFrequency, filterQ: $scope.filterQ}, 
	  {file: "./samples/hihat.wav",      name: "hihat",      fitlerFrequency: $scope.filterFrequency, filterQ: $scope.filterQ}
	];
	
	$scope.noteKeys = ['z', 's', 'x', 'd', 'c', 'v', 'g', 'b', 'h', 'n', 'j', 'm',    
					   'q', '2', 'w', '3', 'e', 'r', '5', 't', '6', 'y', '7', 'u',
					   'i', '9', 'o', '0', 'p'];
								
	$scope.noteKeysActive = [];
	
	// sound generation

	$scope.randomize = function() {
		$scope.drumGrid=[];
		for (var i=0; i<$scope.drumSamples.length; i++) {
			$scope.drumGrid[i]=[];
			for (var j=0; j<16; j++) {
				$scope.drumGrid[i][j]=(Math.random()>0.75)?true:false;
			}
		}
	};

	$scope.clear = function() {
		$scope.drumGrid=[];
		for (var i=0; i<$scope.drumSamples.length; i++) {
			$scope.drumGrid[i]=[];
		}
	};		
	
	$scope.playWav = function(buffer, filterFrequency, q) {
		var source1 = $scope.context.createBufferSource();
		source1.buffer = buffer;
		
		if (filterFrequency>0) {
			var filter = $scope.context.createBiquadFilter();
			filter.type = "lowpass"; // Low-pass filter.
			filter.frequency.value = filterFrequency; 
			
			if (q>0) {
				filter.Q.value = q;
			}
			
			source1.connect(filter);
			filter.connect($scope.context.destination);
		}
		else {
			source1.connect($scope.context.destination);
		}
		
		source1.start(0);
	}		
	
	$scope.playNote = function(index) {
	
		var n = getNoteFromKey(index);
	
		var filter = $scope.context.createBiquadFilter();
		filter.type = "lowpass"; // Low-pass filter.
		filter.frequency.value = $scope.filterFrequency; 
		filter.Q.value = $scope.filterQ; 

		var osc = $scope.context.createOscillator(); // Create sound source
		var osc2 = $scope.context.createOscillator(); // Create sound source
		osc.type = "square";
		osc2.type = "square";
		var gain = $scope.context.createGain(); // Create gain node
		gain.gain.value=0.6;
		osc.connect(gain);
		osc2.connect(gain);
		
		gain.connect(filter); // Connect sound to output
		
		filter.connect($scope.context.destination);
		
		osc.frequency.value = calculateFrequency(n);
		osc2.frequency.value = calculateFrequency(n)*3; 
		
		osc2.detune.value = 10; // value in cents
		osc.start(0);
		osc2.start(0);
		
		// var i1 = setInterval(function(){ osc.frequency.value += 0.5;}, 10);
		var i2 = setInterval(function(){ if (gain.gain.value>0)  { gain.gain.value -= 0.007; } else { gain.gain.value=0;} }, 5);
		setTimeout(function() {
			osc.stop();
			osc2.stop();
			//clearInterval(i1);
			clearInterval(i2);
		}, 1500);
	};	

	$scope.togglePlay = function() {
		$scope.play = !$scope.play;
		if ($scope.play) { 
			setTimeout(tick, 1);
		}
	};
				
	// utility

	$scope.isBlackKey =  function(index) {
		if (notes[index % 12].indexOf("#") > -1)
			return true;
		else
			return false;
	};
	
	$scope.isWhiteKey =  function(index) {
		return !$scope.isBlackKey(index);
	};			

	$scope.range = function(a, b, step) {
		var v= [];

		v.push(a);
		step= step || 1;
		while(a+step< b) {
			a+=step;
			v.push(a);
		}
		return v;
	};

	// private functions and properties

	var notes = ["C", "C#", "D", "D#",  "E",  "F",  "F#",  "G",  "G#", "A", "A#", "B"];		

	function bpmToMillisec(bpm) {
		return (1000*60) / (bpm*4);
	}

	function calculateFrequency(note) {
		return 440 * Math.pow(2, note/12);
	}
	
	function tick() {
		if (!$scope.play) 
			return;

		setTimeout(tick, bpmToMillisec($scope.tempo));

		for (var i=0; i<$scope.drumSamples.length; i++) {
			if ($scope.drumGrid[i][$scope.currentTick])
				$scope.playWav($scope.bufferList[i], $scope.drumSamples[i].filterFrequency, $scope.drumSamples[i].filterQ);
		};

		$scope.$apply(function() {
			$scope.currentTick = ($scope.currentTick + 1) % 16;			
		});
	};	
	
	function createAudioContext() {
		var contextClass = (window.AudioContext || 
		  window.webkitAudioContext || 
		  window.mozAudioContext || 
		  window.oAudioContext || 
		  window.msAudioContext);
		if (contextClass) {
			return new contextClass();
		} else {
			alert("Audio not supported.");
		  return null;
		}	
	};

	function init() {
		$scope.context = createAudioContext();
		
		// wav files
		var drumSamplesFiles = [];
		
		for (var i=0; i<$scope.drumSamples.length; i++) {
			drumSamplesFiles.push($scope.drumSamples[i].file);
		};

		var bufferLoader = new BufferLoader(
			$scope.context,
			drumSamplesFiles,
			function() {
				console.log("Samples load complete."); 
				$scope.bufferList = this.bufferList;
			}
		);

		bufferLoader.load();	
		
		// shortcuts
		for (var i=0; i<$scope.noteKeys.length; i++) {
			$scope.noteKeysActive.push(false);
		}
		for (var i=0; i<$scope.noteKeys.length; i++) {
			hotkeys.add({
				combo: $scope.noteKeys[i],
				callback: createPlayNoteFunction(i)
			});
		};
		
		// create a random pattern
		$scope.randomize();
	};	
	
	function createPlayNoteFunction(index) {
		return function() {
			$scope.playNote(index);  
			$scope.noteKeysActive[index] = true;
			setTimeout(createStopNoteFunction(index), 400);
		};
	};
	
	function createStopNoteFunction(index) {
		return function() {
			$scope.$apply(function() {$scope.noteKeysActive[index]=false;});
		};
	};
	
	function getNoteFromKey(index) {
		return index-12*4+3;
	};		

	// let's go!
	
	init();
});
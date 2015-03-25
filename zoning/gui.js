function ZoningGUI() {
	var controls = {
		gui: null,
		"Zone": 0
	};
	
	var init = function() {
		controls.gui = new dat.GUI();

		var zonings = controls.gui.addFolder('Zoning');

		zonings.add(controls, "Zone", {Residential: 0, Commercial: 1, Industrial: 2, Park: 3, Road: 4}).onChange( controls.zoneChanged );

		zonings.open();
	}
	
	controls.zoneChanged = function() {
		var data = {
			detail: {
				value: controls["Zone"]
			}
		}

		window.dispatchEvent( new CustomEvent( 'zone_type_changed', data ) );
	}
	
	init.call(this);
}
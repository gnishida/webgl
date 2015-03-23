Sidebar.Object3D = function (signals) {
	var container = new UI.Panel();
	container.setBorderTop("1px solid #ccc");
	container.setDisplay("none");
	container.setPadding("10px");

	var objectType = new UI.Text().setColor("#666");
	container.add(objectType);
	container.add(new UI.Break(), new UI.Break());

	//////////////////////////////////////////////////////////////////////////////
	// Properties
	
	// Name
	var objectNameRow = new UI.Panel();
	var objectName = new UI.Input().setWidth("150px").setColor("#444").setFontSize("12px").onChange(update);
	objectNameRow.add(new UI.Text("Name").setWidth("90px").setColor("#666"));
	objectNameRow.add(objectName);
	container.add( objectNameRow );

	// Height
	var objectHeightRow = new UI.Panel();
	var objectHeight = new UI.Number().setWidth("50px").onChange(update);
	objectHeightRow.add(new UI.Text("Height").setWidth("90px").setColor("#666"));
	objectHeightRow.add(objectHeight);
	container.add(objectHeightRow);

	// Front
	var objectFrontRow = new UI.Panel();
	var objectFront = new UI.Number().setWidth("50px").onChange(update);
	objectFrontRow.add(new UI.Text("Front").setWidth("90px").setColor("#666"));
	objectFrontRow.add(objectFront);
	container.add(objectFrontRow);

	// Side
	var objectSideRow = new UI.Panel();
	var objectSide = new UI.Number().setWidth("50px").onChange(update);
	objectSideRow.add(new UI.Text("Side").setWidth("90px").setColor("#666"));
	objectSideRow.add(objectSide);
	container.add(objectSideRow);

	// Rear
	var objectRearRow = new UI.Panel();
	var objectRear = new UI.Number().setWidth("50px").onChange(update);
	objectRearRow.add(new UI.Text("Rear").setWidth("90px").setColor("#666"));
	objectRearRow.add(objectRear);
	container.add(objectRearRow);

	//
	var selected = null;

	/**
	 * Update the geometry of the selected object based on "Mesh" property window
	 */
	function update() {
		if (selected && selected.fbc_type == "Block") {
			selected.traverse(function (object) {
				object.fbc_h = objectHeight.getValue();
				object.fbc_f = objectFront.getValue();
				object.fbc_s = objectSide.getValue();
				object.fbc_r = objectRear.getValue();
				if (object.fbc_type == "Building") {
					var width = object.fbc_width - object.fbc_s * 2;
					var depth = object.fbc_depth - object.fbc_f - object.fbc_r;
					
					object.scale.x = width;
					object.scale.y = objectHeight.getValue();
					object.scale.z = depth;
					object.position.x = object.fbc_s + width/2 - object.fbc_width/2;
					object.position.y = objectHeight.getValue() / 2;
					object.position.z = object.fbc_f + depth/2 - object.fbc_depth/2;
				}
			});
			
			signals.objectChanged.dispatch(selected);
		}
	}

	/**
	 * Event: an object is selected.
	 * Update the "Mesh" property window based on the seleced object.
	 */
	signals.objectSelected.add(function (object) {
		selected = object;

		if (object) {
			refreshObjectUI(object);
		} else {
			container.setDisplay("none");
		}
	} );
	
	signals.cameraChanged.add(function (camera) {
		if (camera && camera === selected) {
			refreshObjectUI( camera );
		}
	} );

	function refreshObjectUI(object) {
		container.setDisplay("block");

		objectType.setValue(object.fbc_type);
		objectName.setValue(object.name);
		objectHeight.setValue(object.fbc_h);
		objectFront.setValue(object.fbc_f);
		objectSide.setValue(object.fbc_s);
		objectRear.setValue(object.fbc_r);
	}

	return container;
}

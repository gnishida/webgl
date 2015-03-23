Sidebar.Scene = function (signals) {
	var objectTypes = {
		'PerspectiveCamera': THREE.PerspectiveCamera,
		'AmbientLight': THREE.AmbientLight,
		'DirectionalLight': THREE.DirectionalLight,
		'HemisphereLight': THREE.HemisphereLight,
		'PointLight': THREE.PointLight,
		'SpotLight': THREE.SpotLight,
		'Mesh': THREE.Mesh,
		'Object3D': THREE.Object3D
	};

	var container = new UI.Panel();
	container.setPadding("10px");
	container.setBorderTop("1px solid #ccc");

	container.add(new UI.Text("SCENE").setColor("#666"));
	container.add(new UI.Break(), new UI.Break());

	var outliner = new UI.FancySelect().setWidth( '100%' ).setHeight('140px').setColor( '#444' ).setFontSize( '12px' ).onChange( updateOutliner );
	container.add(outliner);

	//
	var scene = null;

	/**
	 * Return the object type.
	 */
	function getObjectType(object) {
		for (var type in objectTypes) {
			if (object instanceof objectTypes[type]) return type;
		}
	}

	/**
	 * Update the selected object based on "outliner.getValue()".
	 */
	function updateOutliner() {
		var id = parseInt(outliner.getValue());
		scene.traverse(function (node) {
			if (node.id === id) {
				signals.objectSelected.dispatch(node);
				return;
			}
		} );
	}

	/**
	 * Event: some objects are added.
	 * Update the list in "Scene" property window, because some objects are added.
	 */
	signals.sceneChanged.add(function (object) {
		scene = object;

		var options = {};

		( function createList(object, pad) {
			for (var key in object.children) {
				var child = object.children[key];
				if (child.fbc_type == "Block") {
					options[child.id] = pad + child.name + ' <span style="color: #aaa">- ' + getObjectType(child) + '</span>';
					//createList(child, pad + "&nbsp;&nbsp;&nbsp;");
				}
			}
		} )( scene, '' );

		outliner.setOptions(options);
	} );

	/**
	 * Event: an object is selected in the viewport.
	 * Update the highlight in "Scene" property window, because the selected object is changed.
	 */
	signals.objectSelected.add(function (object) {
		outliner.setValue(object !== null ? object.id : null);
	} );

	return container;

}

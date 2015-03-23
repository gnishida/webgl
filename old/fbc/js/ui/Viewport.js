var Viewport = function (signals) {
	var container = new UI.Panel();
	container.setPosition("absolute");
	container.setBackgroundColor("#aaa");

	var objects = [];

	// helpers
	var sceneHelpers = new THREE.Scene();

	var grid = new THREE.GridHelper(300, 10);
	sceneHelpers.add(grid);

	var selectionBox = new THREE.Mesh(new THREE.CubeGeometry( 1, 1, 1 ), new THREE.MeshBasicMaterial({color: 0x000000, wireframe: true, fog: false}));
	selectionBox.matrixAutoUpdate = false;
	selectionBox.visible = false;
	sceneHelpers.add(selectionBox);

	//
	var scene = new THREE.Scene();

	var camera = new THREE.PerspectiveCamera(50, container.dom.offsetWidth / container.dom.offsetHeight, 1, 5000);
	camera.position.set(300, 150, 300);
	camera.lookAt(scene.position);
	
	// light
	var light1 = new THREE.DirectionalLight(0xffffff);
	light1.position.set(1000, 2000, 1000).normalize();
	scene.add(light1);
	var light2 = new THREE.DirectionalLight(0xffffff);
	light2.position.set(-1000, 2000, 1000).normalize();
	scene.add(light2);
	var light3 = new THREE.DirectionalLight(0xffffff);
	light3.position.set(-1000, 2000, -1000).normalize();
	scene.add(light3);
	var light1 = new THREE.DirectionalLight(0xffffff);
	light1.position.set(1000, 2000, -1000).normalize();
	scene.add(light1);

	// object picking
	var intersectionPlane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000, 8, 8));
	intersectionPlane.visible = false;
	sceneHelpers.add( intersectionPlane );

	var ray = new THREE.Raycaster();
	var projector = new THREE.Projector();
	var offset = new THREE.Vector3();

	var cameraChanged = false;

	//
	var picked = null;
	var selected = camera;

	// events
	var onMouseDown = function (event) {
		container.dom.focus();
		event.preventDefault();
		cameraChanged = false;
	};
	
	var onClick = function (event) {
		if ( event.button == 0 && cameraChanged === false ) {
			var vector = new THREE.Vector3(
				( ( event.clientX - container.dom.offsetLeft ) / container.dom.offsetWidth ) * 2 - 1,
				- ( ( event.clientY - container.dom.offsetTop ) / container.dom.offsetHeight ) * 2 + 1,
				0.5
			);

			projector.unprojectVector(vector, camera);

			ray.set(camera.position, vector.sub(camera.position).normalize());
			var intersects = ray.intersectObjects(objects, true);

			selected = camera;
			for (var i = 0; i < intersects.length; i++) {
				if (intersects[i].object.fbc_type == "Block") {
					selected = intersects[i].object;
					break;
				}
			}

			signals.objectSelected.dispatch( selected );
		}

		controls.enabled = true;
	};

	container.dom.addEventListener("mousedown", onMouseDown, false);
	container.dom.addEventListener("click", onClick, false);

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.
	var controls = new THREE.TrackballControls(camera, container.dom);
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.addEventListener("change", function () {
		cameraChanged = true;
		signals.cameraChanged.dispatch(camera);
		render();
	} );

	// signals
	signals.objectAdded.add(function (object) {
		object.traverse(function (object) {
			objects.push(object);
		} );

		scene.add(object);

		signals.sceneChanged.dispatch(scene);
		signals.objectSelected.dispatch(object);

	} );

	/**
	 * Event: Some changes occur and "redrawing" is necessary.
	 * Update the visualization on the screen. This is like "Redraw".
	 */
	signals.objectChanged.add(function (object) {
		if (object instanceof THREE.Camera) {
			object.updateProjectionMatrix();
		}

		render();
		
		signals.sceneChanged.dispatch(scene);
		signals.objectSelected.dispatch(object);
	} );

	/**
	 * Event: An object is selected.
	 * Show a bounding box of the selected object.
	 */
	signals.objectSelected.add(function (object) {
		selectionBox.visible = false;

		if ( object !== null ) {
			if ( object.geometry !== undefined ) {
				var geometry = object.geometry;

				if ( geometry.boundingBox === null ) {
					geometry.computeBoundingBox();
				}

				var vertices = selectionBox.geometry.vertices;

				vertices[ 0 ].x = geometry.boundingBox.max.x;
				vertices[ 0 ].y = geometry.boundingBox.max.y + object.fbc_h;
				vertices[ 0 ].z = geometry.boundingBox.max.z;
				vertices[ 1 ].x = geometry.boundingBox.max.x;
				vertices[ 1 ].y = geometry.boundingBox.max.y + object.fbc_h;
				vertices[ 1 ].z = geometry.boundingBox.min.z;
				vertices[ 2 ].x = geometry.boundingBox.max.x;
				vertices[ 2 ].y = geometry.boundingBox.min.y;
				vertices[ 2 ].z = geometry.boundingBox.max.z;
				vertices[ 3 ].x = geometry.boundingBox.max.x;
				vertices[ 3 ].y = geometry.boundingBox.min.y;
				vertices[ 3 ].z = geometry.boundingBox.min.z;
				vertices[ 4 ].x = geometry.boundingBox.min.x;
				vertices[ 4 ].y = geometry.boundingBox.max.y + object.fbc_h;
				vertices[ 4 ].z = geometry.boundingBox.min.z;
				vertices[ 5 ].x = geometry.boundingBox.min.x;
				vertices[ 5 ].y = geometry.boundingBox.max.y + object.fbc_h;
				vertices[ 5 ].z = geometry.boundingBox.max.z;
				vertices[ 6 ].x = geometry.boundingBox.min.x;
				vertices[ 6 ].y = geometry.boundingBox.min.y;
				vertices[ 6 ].z = geometry.boundingBox.min.z;
				vertices[ 7 ].x = geometry.boundingBox.min.x;
				vertices[ 7 ].y = geometry.boundingBox.min.y;
				vertices[ 7 ].z = geometry.boundingBox.max.z;

				selectionBox.geometry.verticesNeedUpdate = true;

				selectionBox.matrixWorld = object.matrixWorld;
				selectionBox.visible = true;
			}
			selected = object;
		}

		render();
	} );

	signals.windowResize.add( function () {
		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();
	} );

	//
	var renderer = new THREE.WebGLRenderer({antialias: true, alpha: false, clearColor: 0xdfdfdf, clearAlpha: 1});
	renderer.autoClear = false;
	renderer.autoUpdateScene = false;
	container.dom.appendChild( renderer.domElement );

	animate();

	// set up for hotkeys
	// must be done here, otherwise it doesn't work
	container.dom.tabIndex = 1;
	container.dom.style.outline = "transparent";

	// must come after listeners are registered
	signals.sceneChanged.dispatch(scene);

	function animate() {
		requestAnimationFrame(animate);
		controls.update();
	}

	function render() {
		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		renderer.clear();
		renderer.render(scene, camera);
		renderer.render(sceneHelpers, camera);
	}

	return container;
}

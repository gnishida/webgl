var Sidebar = function (signals) {
	var container = new UI.Panel();
	container.setPosition("absolute");
	container.setClass("sidebar");

	container.add(new Sidebar.Scene(signals));
	container.add(new Sidebar.Object3D(signals));

	return container;
}

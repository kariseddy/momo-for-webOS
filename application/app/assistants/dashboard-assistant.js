function DashboardAssistant(delivery) {
	this.delivery = delivery;
}

DashboardAssistant.prototype = {
	setup: function() {
		this.controller.listen(this.controller.stageController.document, Mojo.Event.stageActivate, this.stageActivate.bind(this));
		this.update(this.delivery);
	},
	update: function(delivery, duntAlert) {
		this.delivery = delivery;

		this.count = 1;

		//creating info
		this.title = delivery.sender.name;
		this.message = AppFormatter.content(delivery.content);

		var bannerMessage = this.title + ': ' + this.message;

		if (!duntAlert) {
			NotifyHelper.instance().bannerNewMsg();
		}
		//NotifyHelper.instance().banner(bannerMessage);
		var info = {
			title: this.title,
			message: this.message,
			count: this.count
		};

		var renderedInfo = Mojo.View.render({
			object: info,
			template: 'dashboard/item-info'
		});
		var infoElement = this.controller.get('dashboardinfo');
		infoElement.innerHTML = renderedInfo;

		this.listenDashboard();
	},
	listenDashboard: function() {
		this.controller.listen(this.controller.get('dashboard-icon'), Mojo.Event.tap, this.iconTapped.bind(this));
		this.controller.listen(this.controller.get('dashboard-body'), Mojo.Event.tap, this.bodyTapped.bind(this));
	},
	iconTapped: function(event) {
		var launchArgs = { //
		};
		this.createStage(launchArgs);
	},
	bodyTapped: function(event) {
		var that = this;
		var launchArgs = { //
		};
		this.createStage(launchArgs);
	},
	createStage: function(launchArgs) {
		AppLauncher.onDashClick(this.delivery);
	},
	stageActivate: function(event) {
		this.controller.stageController.indicateNewContent(false); // no more flashy
	},
	activate: function(event) {},
	deactivate: function(event) {},
	cleanup: function(event) {},
	killSelf: function() {
		this.controller.window.close();
	}
}


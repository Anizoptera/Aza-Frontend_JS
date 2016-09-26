
define(["./Core"], function(Aza)
{
	function Class() {}

	Class.extend = function(ChildClass) {
		return Aza.inherit(this, ChildClass);
	};

	Class.createSurrogateClass = function() {
		return Aza.createSurrogateClass(this, Aza.slice(arguments));
	};

	return Class;
});

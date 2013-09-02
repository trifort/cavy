var MANIFEST = {
	"Resource": {
		"{{texture.trimmedName}}": "{{texture.fullName}}"
	},
	"Sprite": {{% for sprite in allSprites %}
		"{{sprite.trimmedName}}": {
			"src": "{{texture.trimmedName}}",
			"positionX": {{sprite.frameRect.x}},
			"positionY": {{sprite.frameRect.y}},
			"width": {{sprite.frameRect.width}},
			"height": {{sprite.frameRect.height}}
		}{% if not forloop.last %},{% endif %}{% endfor %}
	}
};
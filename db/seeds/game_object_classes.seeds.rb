GameObjectClass.destroy_all
Property.destroy_all

@game = Game.first

investigator 	= GameObjectClass.create(:name => "Investigator", :game_id => @game.id)
detective 		= GameObjectClass.create(:name => "Detective", :parent => investigator, :game_id => @game.id)
priest				= GameObjectClass.create(:name => "Priest", :parent => investigator, :game_id => @game.id)
sorceress			= GameObjectClass.create(:name => "Sorceress", :parent => investigator, :game_id => @game.id)


monster				= GameObjectClass.create(:name => "Monster", :game_id => @game.id)
eldritch			= GameObjectClass.create(:name => "Eldritch", :parent => monster, :game_id => @game.id)
beastly				= GameObjectClass.create(:name => "Beast", :parent => monster, :game_id => @game.id)
cultist 			= GameObjectClass.create(:name => "Cultist", :parent => monster, :game_id => @game.id)

item 					= GameObjectClass.create(:name => "Item", :game_id => @game.id)




investigator.properties.create(:name => "Weapon", :category => :object, :property_klazz => "Item", :game_id => @game.id)
investigator.properties.create(:name => "Backpack", :category => :multi_object, :property_klazz => "Item", :game_id => @game.id)
investigator.properties.create(:name => "Password", :category => :string, :game_id => @game.id)
detective.properties.create(:name => "Investigation Skill", :category => :numeric, :value => 10, :game_id => @game.id)
priest.properties.create(:name => "Piety", :category => :numeric, :value => 100, :game_id => @game.id)
sorceress.properties.create(:name => "Mana", :category => :numeric, :value => 100, :game_id => @game.id)

monster.properties.create(:name => "Horror", :category => :numeric, :value => 10, :game_id => @game.id)
monster.properties.create(:name => "Weak Link", :category => :object, :property_klazz => "Item", :game_id => @game.id)

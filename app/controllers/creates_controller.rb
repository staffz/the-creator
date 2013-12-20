class CreatesController < ApplicationController

	before_filter :setup_active_game

	def show

	end

	def structure
		@structure = @active_game.class_structure
		respond_to do |format|
			format.html{ render :text => "This method does not respond to HTML-requests", :status => 406}
			format.json{ render :text => @structure.to_json, :status => 200 and return}
		end
	end

	def identifier
		@object = @active_game.resolve_identifier(params[:identifier])
		respond_to do |format|
			format.json{ render :template => "/creates/#{@object.class.name.downcase}", :status => 200 }
		end
	end

	def save_property
		property = @active_game.properties.where(["identifier = ?", params[:identifier]]).first
		respond_to do |format|	
			if property
				property.value = params[:value]
				property.save
				property.reload
				format.json{ render :text => {:value => property.value_description, :error => false}.to_json, :status => 200 and return }
			else
				format.json{ render :nothing => true, :status => 500 and return }
			end
		end
	end

	def load_property
		@property = @active_game.properties.where(["identifier = ?", params[:identifier]]).first
		respond_to do |format|
			if @property
				format.json{}
			else
				format.json{ render :text => {:error => true}.to_json, :status => 404 and return }
			end
		end
	end

	def remove
		@object = @active_game.resolve_identifier(params[:identifier])
		respond_to do |format|
			if @object && @object.handle_removal(params[:scope])
				format.json{ render :text => {:error => false}.to_json, :status => 200 }
			else
				format.json{ render :text => {:error => true}.to_json, :status => 500 }
			end
		end
	end

	private

	def setup_active_game
		@active_game = Game.first
	end

end

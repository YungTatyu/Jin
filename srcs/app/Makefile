.PHONY: all


ANCHOR_DEPLOY = @anchor deploy
ANCHOR_BUILD = @anchor build

# In your development environment, run this command:
NEXT_DEV = npx next dev -p 3000
# npx next start is a command for the production environment, so let's define it just in case. 
# Change it from NEXT_DEV when running in production.
NEXT_START = npx next start -p 3000

all:
	cd project
	$(ANCHOR_DEPLOY) > ../anchor_id.txt
	cd ../
	python grep.py
	./replace_program_id.sh
	cd project
	$(ANCHOR_BUILD)
	$(ANCHOR_DEPLOY)
	cd ../
	$(NEXT_DEV)

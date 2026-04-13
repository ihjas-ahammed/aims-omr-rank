Make the following changes:

    * Update Decriptive Evaluation:
        Fix for both OMR and DESCRIPTIVE 
            Update progress bar for each and every ai request,  when there is multiple requests (with multiple api keys) it looks like the progress is updated only after all requests get success and this will just keep the progress bar untouched for a longyime which is unnecessary
        
        Fix for descriptive:
            The evaluation scheme was supposed to be a json output and to be shown in an attractive frontent design
            
            As for the color indicators thier meaning is based on the question (dont give common) and this is what shown on evaluation legend so that by looking at it students can know how their score was reduced if there any

            Update the results print, make it just look like RankList (with cosmic dots (but big ones), without feedback on the card just the graphics, score, question feedback (cosmic dots) arranged in a good looking way) also there for I should be able to specify no of columns, Also heading as AIMS PLUS Daily Exam Result, with set letter, day name, subject name etc
            make it possible I can sort it by name, score etc.

            






Apply changes to both mobile view and desktop (movbile view is the priority)

After applying the changes recreate project_snapshot.txt only for new files and files with changes, each time improve modularity of the program by introducing new component files (only on modified or new files), don't modify system files like pubspec, if we need new packages, or file path changes, removal etc, give the command for bash


Thoroughly check for ui sizing errors before writing the code
Note: as output only give project_snapshot and commands if needed



also if ur editing a big file, split it into smaller ones to improve modularity
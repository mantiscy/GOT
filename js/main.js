$(function() {
  
    // Declare variables to be used

    var questions = [];
    var current_question;
    var current_question_index = -1;
    var score = 0;

    $('.modal').leanModal({
      opacity: .1, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200 // Transition out duration
    });


    function setupQuiz()
    {
        getJsonData();
    }

    function getJsonData()
    {
        // Get Quiz questions
        $.getJSON( "http://proto.io/en/jobs/candidate-questions/quiz.json", function( data ) {

            for(var i=0; i<data.questions.length; i++)
            {
                questions.push(data.questions[i]);
            }

            // Get Quiz results once questions are loaded
            $.getJSON( "http://proto.io/en/jobs/candidate-questions/result.json", function( data ) {
                console.log(data);
                displayQuestion();
            });
        });
    }

    function displayQuestion()
    {
        var content = ""; //Variable used to store answers HTML to be appended to #answers div

        $('#answers').empty();

        if(current_question_index >= 0)
        {
            questions.splice(current_question_index, 1);
        }
        console.log(questions);

        //get a random question and remove it from list a available questions
        current_question_index = Math.floor(Math.random()*questions.length);
        current_question = questions[current_question_index];

        //Display title attribute
        $('#q_title').text(current_question.title);
        
        //Check question Type and display relevant view
        if(current_question.question_type === "mutiplechoice-single")
        {
            //Shuffle answer set
            shuffle(current_question.possible_answers);

            //Loop through answer set and create HTML which displays the answers
            for(var i=0; i<current_question.possible_answers.length; i++)
            {
                content += '<div class="col s6 answer_box" id="'+ current_question.possible_answers[i].a_id +'">'+ current_question.possible_answers[i].caption +'</div>';
            }
            
            $('#answers').append(content);
        }
        else if(current_question.question_type === "mutiplechoice-multiple")
        {
            //Shuffle answer set
            shuffle(current_question.possible_answers);

            //Loop through answer set and create HTML which displays the answers
            for(var i=0; i<current_question.possible_answers.length; i++)
            {
                content += '<div class="col s6 answer_box" id="'+ current_question.possible_answers[i].a_id +'">'+ current_question.possible_answers[i].caption +'</div>';
            }

            //get sum of correct answers based on id
            var answers_sum = 0;
            for(var i=0; i<current_question.correct_answer.length; i++)
            {
                answers_sum += parseInt(current_question.correct_answer[i] ,10);
            }

            $('#answers').append(content);
        }
        else //true or false type
        {
            content += '<div class="col s6 answer_box" id="true">TRUE</div><div class="col s6 answer_box" id="false">FALSE</div>';
            $('#answers').append(content);
        }
    }

    function shuffle(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    }

    //Actions to be taken after user's answer has been validated as correct
    function correct_answer()
    {
        score += current_question.points;

        $('#modal1').openModal();

        //Close modal and display new question after 3 seconds
        setTimeout(function(){
            $('#modal1').closeModal();
            displayQuestion();
        }, 3000);
    }

    function wrong_answer()
    {
        $('#modal2').openModal(); //Open modal

        //Close modal and display new question after 3 seconds
        setTimeout(function(){
            $('#modal2').closeModal();
            displayQuestion();
        }, 3000);
    }

    setupQuiz();

    //////////////////////////////////  EVENT HANDLERS  ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    // Trigger when user clicks on an answer
    $('body').on('click', '.answer_box', function(){
        
        if(current_question.question_type === "mutiplechoice-single")
        {
            //Compare the id of the selected item with the id of the correct answer
            if(parseInt($(this).attr('id'), 10) == current_question.correct_answer)
            {
                correct_answer();
            }
            else
            {
                wrong_answer();
            }
        }
        else if(current_question.question_type === "mutiplechoice-multiple")
        {
            $(this).addClass('selected'); // Mark answer as selected

            //Check if the user selected man number of possible answers -- It must equal the number of correct answers otherwise let the player continue answering
            if($(this).parent().find('.selected').length == current_question.correct_answer.length)
            {
                var selected = $(this).parent().find('.selected');
                var counter = 0; //Keep track of answers checked

                for(var i=0; i<selected.length; i++)
                {
                    //If the selected answer is included in the array of correct answers, the comparison will return the index
                    // We increment the counter of correct answers found
                    if($.inArray( parseInt(selected[i].id ,10), current_question.correct_answer ) >= 0)
                    {
                        counter++;
                    }
                }

                // Check if the number of correct answers found is equal to the number of correct answers which indicates that the user answered correctly
                if(counter == current_question.correct_answer.length)
                {
                    correct_answer();
                }
                else
                {
                    wrong_answer();
                }
            }
        }
        else
        {
            var bool_answer = false;
            
            if($(this).attr('id') == 'true')
            {
                bool_answer = true;
            }

            if(bool_answer == current_question.correct_answer)
            {
                correct_answer();
            }
            else
            {
                wrong_answer();
            }
        }
    });

});
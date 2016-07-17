$(function() {
  
    // Declare variables to be used

    var questions = []; //Holds quiz questions
    var results = []; //Holds results.json
    var total_available_points = 0; //The total number of points available to win
    var current_question;
    var current_question_index = -1;
    var score = 0;


    function setupQuiz()
    {
        $('#replay_btn').hide();
        $('#final_score').hide();
        getJsonData();
    }

    //Get all the data needed
    //Populate questions and results arrays
    //Call to display first question
    function getJsonData()
    {
        // Get Quiz questions
        $.getJSON( "http://proto.io/en/jobs/candidate-questions/quiz.json", function( data ) {

            $('#quiz_head').text(data.title);
            for(var i=0; i<data.questions.length; i++)
            {
                total_available_points += data.questions[i].points; //Calculate the total available points to be won
                questions.push(data.questions[i]); //Create object which contains the questions
                shuffle(questions);
            }

            // Get Quiz results once questions are loaded
            $.getJSON( "http://proto.io/en/jobs/candidate-questions/result.json", function( data_res ) {
                
                for(var i=0; i<data_res.results.length; i++)
                {
                    results.push(data_res.results[i]);
                }

                displayQuestion();
            });
        });
    }

    function displayQuestion()
    {
        var content = ""; //Variable used to store answers HTML to be appended to #answers div

        //reset fields
        $('#answers').empty();
        $('#q_image').empty();
        $('#message').hide();
        $('#num_answers_info').addClass('hidden');

        //Remove last question form list of available questions
        if(current_question_index >= 0)
        {
            questions.splice(current_question_index, 1);
            if(questions.length == 0)
            {
                showResult();
                return;
            }
        }
        console.log(questions);

        //get a random question and remove it from list a available questions
        current_question_index = Math.floor(Math.random()*questions.length);
        current_question = questions[current_question_index];

        //Display title attribute and image
        $('#q_title').text(current_question.title);
        $('#q_image').append('<img src='+ current_question.img +'>');
        
        //Check question Type and display relevant view
        if(current_question.question_type === "mutiplechoice-single")
        {
            //Shuffle answer set
            shuffle(current_question.possible_answers);

            //Loop through answer set and create HTML which displays the answers
            for(var i=0; i<current_question.possible_answers.length; i++)
            {
                content += '<div class="col s6 answer_box"><span class="answer_text" id="'+ current_question.possible_answers[i].a_id +'">'+ current_question.possible_answers[i].caption +'</span></div>';
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
                content += '<div class="col s6 answer_box"><span class="answer_text" id="'+ current_question.possible_answers[i].a_id +'"">'+ current_question.possible_answers[i].caption +'</span></div>';
            }

            $('#answers').append(content);

            //Tell the user how many answers to choose
            $('#num_answers_info').text('You need to select '+ current_question.correct_answer.length + ' answers').removeClass('hidden');
        }
        else //true or false type
        {
            content += '<div class="col s6 answer_box"><span class="answer_text" id="true">TRUE</span></div><div class="col s6 answer_box"><span class="answer_text" id="false">FALSE</span></div>';
            $('#answers').append(content);
        }
    }

    //Shuffles the array passed
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

        $('#submit_btn').hide();
        $('#message').text('CORRECT!!!').css('color', 'green').show();

        //Show correct and display new question after 3 seconds
        setTimeout(function(){
            $('#message').hide();
            $('#submit_btn').show();
            displayQuestion();
        }, 3000);
    }

    function wrong_answer()
    {
        //Hide submit button and show message
        $('#submit_btn').hide();
        $('#message').text('AWW, WRONG ANSWER :(').css('color', 'red').show();

        //Hide wrong and display new question after 3 seconds
        setTimeout(function(){
            $('#message').hide();
            $('#submit_btn').show();
            displayQuestion();
        }, 3000);
    }

    function showResult()
    {
        $('#submit_btn').hide();
        $('#quiz_head').hide();
        var score_percent = score/total_available_points*100;

        for(var i=0; i<results.length; i++)
        {
            if(score_percent >= results[i].minpoints && score_percent <= results[i].maxpoints)
            {
                $('#q_title').text(results[i].title);
                $('#final_score').text('Score: '+ score_percent.toFixed(2) +'%').show();
                $('#message').addClass('blue-text').text(results[i].message).show();
                $('#q_image').empty().append('<img src='+ results[i].img +'>');
                $('#replay_btn').show();
            }
        }
    }

    setupQuiz();

    //////////////////////////////////  EVENT HANDLERS  ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    // Trigger when user clicks on an answer
    $('body').on('click', '.answer_box', function(){

        //For single answer questions, check if an answer was already selected and unselect it
        //Then add new selection
        if(current_question.question_type == "mutiplechoice-single" || current_question.question_type == "truefalse")
        {
            var silver = $(this).parent().find('.silver').removeClass('silver');
            $(this).find('.answer_text').addClass('silver');
        }

        //Check for multi-answer
        if(current_question.question_type == "mutiplechoice-multiple")
        {
            var silver = [];
            silver = $(this).parent().find('.silver');

            //Check if user is selecting or unselecting an answer
            //and also warn the user if he tries to select more than the allowed number of answers
            if($(this).find('.answer_text').hasClass('silver'))
            {
                // $(this).css("background-color", "white");
                $(this).find('.answer_text').removeClass('silver');
            }
            else
            {
                if(silver.length >= current_question.correct_answer.length)
                {
                    // alert('You are only allowed to select ' + current_question.correct_answer.length + ' answers.');
                    $('#message').text('You can only select a total of '+ current_question.correct_answer.length + ' answers').css('color', 'orange').show();
                }
                else
                {
                    $(this).find('.answer_text').addClass('silver');
                }
            }

        }
    });


    //Handler for clicking on submit button
    $('#submit_btn').click(function(ev){
        
        //Check that there is at least one selected answer
        if($('#answers').find('.silver').length <= 0)
        {
            $('#message').text('Please select an answer').css('color', 'red').show();
        }
        //Check for multi answers that the correct number of answers has been selected
        else if(current_question.question_type == "mutiplechoice-multiple" && $('#answers').find('.silver').length != current_question.correct_answer.length)
        {
            $('#message').text('You need to select a total of '+ current_question.correct_answer.length + ' answers').css('color', 'orange').show();
        }
        //If no errors proceed
        else
        {
            //For single answer questions check if the answer is correct by reading the ID
            if(current_question.question_type == "mutiplechoice-single")
            {
                var id = parseInt($('.silver')[0].id, 10); // Get the id of selected element

                //Compare the id of the selected item with the id of the correct answer
                if(id == current_question.correct_answer)
                {
                    $('#'+ id +'').css("background-color", "green"); //Mark answer as correct with green bg
                    correct_answer();
                }
                else //answer is wrong
                {
                    $('#'+ id +'').css("background-color", "red"); // Mark the answer as wrong with red bg
                    $('#'+current_question.correct_answer+'').css("background-color", "green"); //Indicate correct answer in green
                    wrong_answer();
                }
            }
            else if(current_question.question_type == "mutiplechoice-multiple")
            {

                //Check if the user selected man number of possible answers -- It must equal the number of correct answers otherwise let the player continue answering
                if($('.silver').length == current_question.correct_answer.length)
                {
                    //Get user answers
                    var selected = $('#answers').find('.silver');
                    var counter = 0; //Keep track of answers checked

                    for(var i=0; i<selected.length; i++)
                    {
                        //If the selected answer is included in the array of correct answers, the comparison will return the index
                        // We increment the counter of correct answers found
                        console.log(selected[i].id);
                        if($.inArray( parseInt(selected[i].id ,10), current_question.correct_answer ) >= 0)
                        {
                            counter++;
                        }
                    }

                    // Check if the number of correct answers found is equal to the number of correct answers which indicates that the user answered correctly
                    if(counter == current_question.correct_answer.length)
                    {
                        for(var i=0; i<current_question.correct_answer.length; i++)
                        {
                            $('#'+ current_question.correct_answer[i] +'').css("background-color", "green");
                        }
                        correct_answer();
                    }
                    else
                    {
                        for(var i=0; i<current_question.correct_answer.length; i++)
                        {
                            $('#'+ current_question.correct_answer[i] +'').css("background-color", "green");
                        }
                        wrong_answer();
                    }
                }
            }
            else //True or false question
            {
                var bool_answer = false;
                var id = $('.silver')[0].id; // Get the id of selected element
                
                if(id == 'true')
                {
                    bool_answer = true;
                }

                if(bool_answer == current_question.correct_answer)
                {
                    $('#'+ id +'').css("background-color", "green");
                    correct_answer();
                }
                else
                {
                    $('#'+ id +'').css("background-color", "red"); // Mark the answer as wrong with red bg
                    $('#'+current_question.correct_answer+'').css("background-color", "green"); //Indicate correct answer in green
                    wrong_answer();
                }
            }
        }
    });

    //Handler to replay the game
    $('#replay_btn').click(function(){
        location.reload();
    });

});
$(function() {
  
    // Declare variables to be used

    var questions = [];
    var current_question;


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

        //get a random question and remove it from list a available questions
        current_question = questions.splice(Math.floor(Math.random()*questions.length),1);
console.log(current_question);
        $('#q_title').text(current_question[0].title);
        
        //Check question Type and display relevant view
        if(current_question[0].question_type === "mutiplechoice-single")
        {
            //Loop through answer set
            // console.log(current_question[0].possible_answers[0].caption);
            for(var i=0; i<current_question[0].possible_answers.length; i++)
            {
                content += '<div class="col s6 answer_box" id="'+ current_question[0].possible_answers[i].a_id +'">'+ current_question[0].possible_answers[i].caption +'</div>';
            }
            content += '<span class="hidden question_type">mutiplechoice-single</span><span class="hidden correct_answer">'+ current_question[0].correct_answer +'</span>'
            $('#answers').append(content);
            $('#answers').addClass('mutiplechoice-single');
        }
        else if(current_question[0].question_type === "mutiplechoice-multiple")
        {

        }
        else //true or false type
        {

        }


    }

    setupQuiz();

    //////////////////////////////////  EVENT HANDLERS  ///////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////

    $('body').on('click', '.answer_box', function(){

        //Get the question type
        var q_type = $(this).parent().find('.question_type').text();
        
        if(q_type === "mutiplechoice-single")
        {
            //Compare the id of the selected item with the id of the correct answer
            if($(this).attr('id') == $(this).parent().find('.correct_answer').text())
            {
                alert('correct');
            }
            else
            {
                alert('false');
            }
        }
    });

});
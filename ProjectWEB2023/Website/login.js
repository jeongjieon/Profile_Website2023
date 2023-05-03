const ANIMATION_DURATION = 300;

const SIDEBAR_EL = document.getElementById("sidebar");

const SUB_MENU_ELS = document.querySelectorAll(
  ".menu > ul > .menu-item.sub-menu"
);

const FIRST_SUB_MENUS_BTN = document.querySelectorAll(
  ".menu > ul > .menu-item.sub-menu > a"
);

const INNER_SUB_MENUS_BTN = document.querySelectorAll(
  ".menu > ul > .menu-item.sub-menu .menu-item.sub-menu > a"
);

class PopperObject {
  instance = null;
  reference = null;
  popperTarget = null;

  constructor(reference, popperTarget) {
    this.init(reference, popperTarget);
  }

  init(reference, popperTarget) {
    this.reference = reference;
    this.popperTarget = popperTarget;
    this.instance = Popper.createPopper(this.reference, this.popperTarget, {
      placement: "right",
      strategy: "fixed",
      resize: true,
      modifiers: [
        {
          name: "computeStyles",
          options: {
            adaptive: false
          }
        },
        {
          name: "flip",
          options: {
            fallbackPlacements: ["left", "right"]
          }
        }
      ]
    });

    document.addEventListener(
      "click",
      (e) => this.clicker(e, this.popperTarget, this.reference),
      false
    );

    const ro = new ResizeObserver(() => {
      this.instance.update();
    });

    ro.observe(this.popperTarget);
    ro.observe(this.reference);
  }

  clicker(event, popperTarget, reference) {
    if (
      SIDEBAR_EL.classList.contains("collapsed") &&
      !popperTarget.contains(event.target) &&
      !reference.contains(event.target)
    ) {
      this.hide();
    }
  }

  hide() {
    this.instance.state.elements.popper.style.visibility = "hidden";
  }
}

class Poppers {
  subMenuPoppers = [];

  constructor() {
    this.init();
  }

  init() {
    SUB_MENU_ELS.forEach((element) => {
      this.subMenuPoppers.push(
        new PopperObject(element, element.lastElementChild)
      );
      this.closePoppers();
    });
  }

  togglePopper(target) {
    if (window.getComputedStyle(target).visibility === "hidden")
      target.style.visibility = "visible";
    else target.style.visibility = "hidden";
  }

  updatePoppers() {
    this.subMenuPoppers.forEach((element) => {
      element.instance.state.elements.popper.style.display = "none";
      element.instance.update();
    });
  }

  closePoppers() {
    this.subMenuPoppers.forEach((element) => {
      element.hide();
    });
  }
}

const slideUp = (target, duration = ANIMATION_DURATION) => {
  const { parentElement } = target;
  parentElement.classList.remove("open");
  target.style.transitionProperty = "height, margin, padding";
  target.style.transitionDuration = `${duration}ms`;
  target.style.boxSizing = "border-box";
  target.style.height = `${target.offsetHeight}px`;
  target.offsetHeight;
  target.style.overflow = "hidden";
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  window.setTimeout(() => {
    target.style.display = "none";
    target.style.removeProperty("height");
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    target.style.removeProperty("overflow");
    target.style.removeProperty("transition-duration");
    target.style.removeProperty("transition-property");
  }, duration);
};
const slideDown = (target, duration = ANIMATION_DURATION) => {
  const { parentElement } = target;
  parentElement.classList.add("open");
  target.style.removeProperty("display");
  let { display } = window.getComputedStyle(target);
  if (display === "none") display = "block";
  target.style.display = display;
  const height = target.offsetHeight;
  target.style.overflow = "hidden";
  target.style.height = 0;
  target.style.paddingTop = 0;
  target.style.paddingBottom = 0;
  target.style.marginTop = 0;
  target.style.marginBottom = 0;
  target.offsetHeight;
  target.style.boxSizing = "border-box";
  target.style.transitionProperty = "height, margin, padding";
  target.style.transitionDuration = `${duration}ms`;
  target.style.height = `${height}px`;
  target.style.removeProperty("padding-top");
  target.style.removeProperty("padding-bottom");
  target.style.removeProperty("margin-top");
  target.style.removeProperty("margin-bottom");
  window.setTimeout(() => {
    target.style.removeProperty("height");
    target.style.removeProperty("overflow");
    target.style.removeProperty("transition-duration");
    target.style.removeProperty("transition-property");
  }, duration);
};

const slideToggle = (target, duration = ANIMATION_DURATION) => {
  if (window.getComputedStyle(target).display === "none")
    return slideDown(target, duration);
  return slideUp(target, duration);
};

const PoppersInstance = new Poppers();

/**
 * wait for the current animation to finish and update poppers position
 */
const updatePoppersTimeout = () => {
  setTimeout(() => {
    PoppersInstance.updatePoppers();
  }, ANIMATION_DURATION);
};

/**
 * sidebar collapse handler
 */
document.getElementById("btn-collapse").addEventListener("click", () => {
  SIDEBAR_EL.classList.toggle("collapsed");
  PoppersInstance.closePoppers();
  if (SIDEBAR_EL.classList.contains("collapsed"))
    FIRST_SUB_MENUS_BTN.forEach((element) => {
      element.parentElement.classList.remove("open");
    });

  updatePoppersTimeout();
});

/**
 * sidebar toggle handler (on break point )
 */
document.getElementById("btn-toggle").addEventListener("click", () => {
  SIDEBAR_EL.classList.toggle("toggled");

  updatePoppersTimeout();
});

/**
 * toggle sidebar on overlay click
 */
document.getElementById("overlay").addEventListener("click", () => {
  SIDEBAR_EL.classList.toggle("toggled");
});

const defaultOpenMenus = document.querySelectorAll(".menu-item.sub-menu.open");

defaultOpenMenus.forEach((element) => {
  element.lastElementChild.style.display = "block";
});

/**
 * handle top level submenu click
 */
FIRST_SUB_MENUS_BTN.forEach((element) => {
  element.addEventListener("click", () => {
    if (SIDEBAR_EL.classList.contains("collapsed"))
      PoppersInstance.togglePopper(element.nextElementSibling);
    else {
      const parentMenu = element.closest(".menu.open-current-submenu");
      if (parentMenu)
        parentMenu
          .querySelectorAll(":scope > ul > .menu-item.sub-menu > a")
          .forEach(
            (el) =>
              window.getComputedStyle(el.nextElementSibling).display !==
                "none" && slideUp(el.nextElementSibling)
          );
      slideToggle(element.nextElementSibling);
    }
  });
});

/**
 * handle inner submenu click
 */
INNER_SUB_MENUS_BTN.forEach((element) => {
  element.addEventListener("click", () => {
    slideToggle(element.nextElementSibling);
  });
});

































var roomValue = "#4987720",
userId = '1122334',
myRoomJson;
$('.roomTitle').text("It's BrainStorming")
$('#roomNameInput').val("It's BrainStorming")
$('.copyLinker2').text(roomValue)
$("textarea").keydown(function(e){
    // Enter was pressed without shift key
    if (e.key == 'Enter' && !e.shiftKey)
    {
        sendT();
        e.preventDefault();
    }
});

$("#send").click(sendT);

function sendT(){
    if($('.message').last().data("number") == userId){
        //showErrors('tips', 'Tips', 'Press Ctrl + Shift to make a new line!');
        $('.message .messArea').last().append('<div class="textM '+userId+' newMmess">'+$('#message').val()+'</div>')
        var goup = setTimeout(function(){
            $('.message .messArea .textM').last().removeClass('newMmess');
        }, 10);
        $('#message').val('')
        goToBottom();
      findText()
    }
}

document.onload = goToBottom();

var chatStatus = 1;
$('.chatArea').on('scroll', function() {
    if($(this).scrollTop() + $(this).innerHeight() < $(this)[0].scrollHeight - $('.message').last().innerHeight() ) {
        newGoD()
    }
})

findText()

function findText(){
    var message = document.querySelectorAll('.textM'),
    i ;
    for(i = 0; i < message.length; i++){
        message[i].innerHTML = linkify(message[i].textContent);
    }
}
var iaeou = 0;
$("#settings").click(clickSetTrans);
function clickSetTrans(){
    if(iaeou == 0){
        $('.settingsBar').addClass('clickSettingsBar')
        $('.changeW').addClass('clickSettingsCont')
        $('#settings').addClass('clickSettings');
        iaeou = 1;
    }else{
        $('.settingsBar').removeClass('clickSettingsBar')
        $('.changeW').removeClass('clickSettingsCont')
        $('#settings').removeClass('clickSettings');
        iaeou = 0;
    }
}

function linkify(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="blank">' + url + "</a>";
    });
}

$("#message").on("input", function() {
    var textarea = document.querySelector("#message")
    enteredText = textarea.value;
    numberOfLineBreaks = (enteredText.match(/\n/g)||[]).length;
    characterCount = enteredText.length + numberOfLineBreaks;
    rowcount = numberOfLineBreaks + 1;
    if(rowcount < 4){
    $("#message").attr('rows', rowcount)
    }
});

function newGoD(){
    $("#goToDown").removeClass('downDowny')
}

$("#groupEdit").click(changeTitle);
$("#titleFirst").click(changeTitle);

function changeTitle(){
    var input = $('#roomNameInput'),
    regExp = /[a-zA-Z]/g;
    input.attr('style', 'display:block;')
    input.select();
    input.focusout(function(){
        if(input.val().trim().length > 5 && regExp.test(input.val().trim())){
        $('.roomTitle').text(input.val())
        input.attr('style', 'display:none;')
        }else{
            showErrors('Invalid Name', 'In making your Room Name, you must enter 5 or more LETTERS.');
            input.val($('.roomTitle')[0].innerHTML);
            console.log('Room title must be over 5 LETTERS.')
            input.attr('style', 'display:none;')
        }
    })
    input.keydown(function(e){
        // Enter was pressed without shift key
        if (e.key == 'Enter' && !e.shiftKey){
        if(input.val().trim().length > 5 && regExp.test(input.val().trim())){
            $('.roomTitle').text(input.val())
                input.attr('style', 'display:none;')
                e.preventDefault();
            }else{
                input.val($('.roomTitle')[0].innerHTML);
                showErrors('error', 'Invalid Name', 'In making your Room Name, you must enter 5 or more LETTERS.');
                console.log('Room title must be over 5 LETTERS.')
                input.attr('style', 'display:none;')
            }
        }
    });
}

function showErrors(type, title, details){
    if(type == 'error'){
    $('.errorsSide').append('<div class="bubble" id="errorBubble"><h1 class="erStatus"> <span class="material-icons">error</span>'+ title +'</h1><p class="erDetails">'+ details+'</p></div>');
    }
    if(type == 'tips'){
    $('.errorsSide').append('<div class="bubble" id="tipsBubble"><h1 class="erStatus"> <span class="material-icons">tips_and_updates</span>'+ title +'</h1><p class="erDetails">'+ details+'</p></div>');
    }
    $('.bubble').attr('style', 'display:block;');

    var start = setTimeout(function(){
        $('.bubble').addClass('bubbleAfter');
    }, 100);
    var end = setTimeout(function(){
        $('.bubble').first().removeClass('bubbleAfter');
        $('.bubble').first().addClass('bubbleGone');
    }, 5000);
    var deleteEl = setTimeout(function(){
        $('.bubble').first().remove();
    }, 5700)
}

$("#goToDown").click(function(){
    goToBottom();
})

function goToBottom(){
    $("#goToDown").addClass('downDowny');
    $('.chatArea').scrollTop($('.chatArea')[0].scrollHeight);
}

$("#linkCopy").click(function(){
    var timer = setTimeout(function(){
        $(".shareLink").addClass('showItem');
        $(".blackout").addClass('blackShow');
    }, 120);
    var timer2 = setTimeout(function(){
        $(".shareLink").attr('style', 'display: block');
        $(".blackout").attr('style', 'display: block');

    }, 100);

    $(".blackout").click(function(){
            $(".shareLink").removeClass('showItem');
            $(".blackout").removeClass('blackShow');
        var timer2 = setTimeout(function(){
            $(".shareLink").attr('style', 'display: none');
            $(".blackout").attr('style', 'display: none');
    
        }, 400);
    }
    )
    $("#copyLinker").click(function(){
        var dummy = document.querySelector("#copyvalue");
        dummy.select();
        document.execCommand("copy");
    })
})











































// ------------------------- THIS IS FOR MESSING AND COMMUNICATION -------------------------//


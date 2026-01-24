document.addEventListener('DOMContentLoaded', () => {
  const msgChatIcon     = document.getElementById("msgChatIcon");
  const msgChatDrawer   = document.getElementById("msgChatDrawer");
  const msgUnreadBadge  = document.getElementById("msgUnreadBadge");
  const msgChatWindow   = document.getElementById("msgChatWindow");
  const msgChatTitle    = document.getElementById("msgChatTitle");
  const msgChatClose    = document.getElementById("msgChatClose");
  const msgMessages     = document.getElementById("msgMessages");
  const msgChatForm     = document.getElementById("msgChatForm");
  const msgChatInput    = document.getElementById("msgChatInput");  

  let currentConversationId = null;

let dragOffsetX, dragOffsetY;
const header = document.querySelector("#msgChatHeader");
const win = document.getElementById("msgChatWindow");

header?.addEventListener("mousedown", e => {
  if (e.target.tagName === "BUTTON") return;
  
  const rect = win.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
  
  const move = e => {
    win.style.left = (e.clientX - dragOffsetX) + "px";
    win.style.top  = (e.clientY - dragOffsetY) + "px";
    win.style.right = "auto";
    win.style.bottom = "auto";
  };

  const up = () => {
    document.removeEventListener("mousemove", move);
    document.removeEventListener("mouseup", up);
  };

  document.addEventListener("mousemove", move);
  document.addEventListener("mouseup", up);
});
  
  
  const socket = io("/messaging", {
    withCredentials: true
  });

  const unreadConversations = new Set();

  
  function updateFloatingBadge() {
    if (unreadConversations.size > 0) {
      msgUnreadBadge.classList.remove("msg-hidden");
    } else {
      msgUnreadBadge.classList.add("msg-hidden");
    }
  }

  
  msgChatIcon.addEventListener("click", () => {
    msgChatDrawer.classList.toggle("msg-hidden");
  });

  
  msgChatClose?.addEventListener("click", () => {
    msgChatWindow.classList.add("msg-hidden");
    if (currentConversationId) {
      socket.emit("leaveConversation", { conversationId: currentConversationId });
      currentConversationId = null;
    }
  });

  function openExistingConversation(conversationId, name) {
    if (!conversationId) return;

    currentConversationId = conversationId;
    msgChatTitle.textContent = name || "Razgovor";
    msgChatWindow.classList.remove("msg-hidden");
    msgMessages.innerHTML = ""; 

    
    socket.emit("joinConversation", { conversationId });

    
    unreadConversations.delete(conversationId);
    updateFloatingBadge();

    
    fetch(`/api/conversation/${conversationId}/messages?limit=20`, { credentials: "include" })
      .then(res => res.json())
      .then(messages => {
        
        [...messages].reverse().forEach(msg => {
          
          const isSelf = (msg.senderName === window.CHAT_USER_NAME || (msg.senderId && (msg.senderId._id === window.CHAT_USER_ID || msg.senderId === window.CHAT_USER_ID)));
          addMessage(msg, isSelf);
        });
        scrollToBottom();

        
        return fetch(`/api/conversation/${conversationId}/read`, { method: "POST", credentials: "include" });
      })
      .catch(err => console.error("Greška pri učitavanju poruka:", err));
  }

  
  function openChat(targetId, name, isTeam = false) {
    if (!targetId) return;
    const endpoint = isTeam ? `/api/conversation/team/${targetId}` : `/api/conversation/direct/${targetId}`;

    fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(data => {
        if (data.conversationId) {
          openExistingConversation(data.conversationId, name);
        }
      })
      .catch(err => console.error("Greška pri otvaranju chata:", err));
  }

  fetch("/api/messaging/drawer", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      
      const msgFriendList = document.getElementById("msgFriendList");
      msgFriendList.innerHTML = ""; 

      data.friends?.forEach(f => {
        const li = document.createElement("li");
        li.dataset.conversationId = f.conversationId;

        
        const avatar = document.createElement("img");
        avatar.classList.add("msg-avatar");
        avatar.src = f.avatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';
        li.appendChild(avatar);

        
        const nameSpan = document.createElement("span");
        nameSpan.classList.add("msg-name");
        nameSpan.textContent = f.name;
        if (f.hasUnread) {
          nameSpan.classList.add("msg-unread");
          unreadConversations.add(f.conversationId);
        }
        li.appendChild(nameSpan);

        li.addEventListener("click", () => {
          openChat(f.id, f.name, false);
          nameSpan.classList.remove("msg-unread");
        });

        msgFriendList.appendChild(li);
      });

      
      const msgTeamList = document.getElementById("msgTeamList");
      msgTeamList.innerHTML = "";

      if (data.team) {
        const li = document.createElement("li");
        li.dataset.conversationId = data.team.conversationId;

        const icon = document.createElement("div");
        icon.classList.add("msg-team-icon");
        icon.textContent = "T";
        li.appendChild(icon);

        const nameSpan = document.createElement("span");
        nameSpan.classList.add("msg-name");
        nameSpan.textContent = data.team.name;
        if (data.team.hasUnread) {
          nameSpan.classList.add("msg-unread");
          unreadConversations.add(data.team.conversationId);
        }
        li.appendChild(nameSpan);

        li.addEventListener("click", () => {
          openChat(data.team.id, data.team.name, true);
          nameSpan.classList.remove("msg-unread");
        });

        msgTeamList.appendChild(li);
      }
      updateFloatingBadge();
    });

  
  socket.on("conversation:unread:update", data => {
    const allItems = [...document.querySelectorAll("#msgFriendList li, #msgTeamList li")];
    const item = allItems.find(li => li.dataset.conversationId === data.conversationId);
    
    if (item) {
      const nameSpan = item.querySelector(".msg-name");
      if (nameSpan) {
        nameSpan.classList.toggle("msg-unread", data.hasUnread);
      }
    }

    if (data.hasUnread) {
      unreadConversations.add(data.conversationId);
    } else {
      unreadConversations.delete(data.conversationId);
    }
    updateFloatingBadge();
  });

  
  
  

  msgChatForm.addEventListener("submit", e => {
    e.preventDefault();
    const body = msgChatInput.value.trim();
    if (!body || !currentConversationId) return;

    socket.emit("message:send", {
      conversationId: currentConversationId,
      body
    });
    msgChatInput.value = "";
  });
  
  socket.on("private:chat:message", msg => { 
      if (msg.conversationId === currentConversationId) {
          addMessage(msg, (msg.senderName === window.CHAT_USER_NAME));
          scrollToBottom();
      }
  });

  function addMessage(msg, isSelf = false) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("msg-message-wrapper");
    if (isSelf) wrapper.classList.add("msg-self");

    
    const sName = msg.senderName || 'Korisnik';
    const sAvatar = msg.senderAvatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';

    wrapper.innerHTML = `
        <img src="${sAvatar}" class="msg-message-avatar" title="${sName}">
        <div class="msg-message-content">
            <span class="msg-message-username">${sName}</span>
            <div class="msg-bubble">${msg.body}</div>
        </div>
    `;

    msgMessages.appendChild(wrapper);
    scrollToBottom();
  }

  function scrollToBottom() {
    msgMessages.scrollTop = msgMessages.scrollHeight;
  }
});
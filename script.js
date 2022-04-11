// ==UserScript==
// @name        Discord @everyone
// @namespace   Violentmonkey Scripts
// @match       https://discord.com/channels/**
// @grant       none
// @version     1.0
// @author      punkk
// @description 2/11/2022, 4:05:58 PM
// ==/UserScript==

async function getAllUsers(){
  const className = /nameAndDecorators-.*/
  const names = []
  var nameContainer = document.querySelectorAll("[class^=nameAndDecorators]")
  var memberContainer = document.querySelectorAll("[class^=membersWrap-]")
  var idContainer = document.querySelectorAll("[class^=member-]")
  const scrollContainer = memberContainer[0].children[0]
  var currentPos = scrollContainer.scrollTop;
  const totalHeight = scrollContainer.scrollHeight - scrollContainer.offsetHeight
  
  var arr = [...idContainer]
  arr.forEach(el => {
      const idLink = el.children[0].children[0].children[0].children[0].children[0].children[0].children[0].src
      console.log(idLink)
      const idRegex = /(https:\/\/cdn.discordapp.com\/avatars\/)([0-9]*)\//g
      var id = idRegex.exec(idLink)
      if(id === null){
            return
      }
      let res = '<@' + id[2] + '>'
      names.push(res)
  })

  // nameContainer.forEach(el => {
  //   let username = el.children[0].textContent
  //   let res = '@' + username
  //   names.push(res)
  // })
  const data = await recurse(nameContainer, memberContainer, scrollContainer, names, currentPos, totalHeight)
  return data
}

async function recurse(nameContainer, memberContainer, scrollContainer, names, currentPos, totalHeight){
  return await new Promise(res => {
    if(currentPos === totalHeight){
      res(names)
  } else {
    nameContainer[nameContainer.length - 1].scrollIntoView()
    setTimeout(()=>{
        const htmlCollection = memberContainer[0].children[0].children[0].children
        const arr = [...htmlCollection]
        var filtered = arr.filter(el => {
          return(
            el.className.includes("member-")
          )
        })
        let currentNames = filtered.map((el)=>{
          const idLink = el.children[0].children[0].children[0].children[0].children[0].children[0].children[0].src
          const idRegex = /(https:\/\/cdn.discordapp.com\/avatars\/)([0-9]*)\//g
          var id = idRegex.exec(idLink)
          if(id === null){
            return
          }
          let res = '<@' + id[2] + '>'
          return res
        })
        currentNames.forEach((el,i) => {
          if(!names.includes(el)){
              names.push(el)
          }
        })
        currentPos = scrollContainer.scrollTop;
        nameContainer = filtered
        res(recurse(nameContainer, memberContainer, scrollContainer, names, currentPos, totalHeight))
      },2000)
    }
  })
}

async function waitForMemberLists() {
  return await new Promise(resolve => {
    var checkExists = setInterval(async () => {
    var memberList = document.querySelectorAll("[class^=nameAndDecorators]")
    if(memberList.length > 0){
      resolve("members list loaded")
      clearInterval(checkExists)
    } else {
      console.log("loading...")
    }
  }, 1000)
  })
}


function getInput(names){
  var nameString = ""
  let filtered = names.filter(el =>{
    return el !== undefined
  })
  filtered.forEach(el => {
    nameString += el
  })
  return nameString
}


async function parseNames(e){
  console.log(e)
  if(e.key === "Shift"){
    const data = await waitForMemberLists()
    const names = await getAllUsers()
    const totalNames = getInput(names)
    window.removeEventListener('keypress', parseNames)
    console.log(totalNames)
  }
}
window.addEventListener('keydown', parseNames)



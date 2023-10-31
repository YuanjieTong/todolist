document.addEventListener("DOMContentLoaded", function () {
  const addIpt = document.querySelector(".add-ipt")
  const listBox = document.querySelector(".list-box")
  const mask = document.querySelector(".mask")
  const confirmBtn = document.querySelector(".confirm-btn")
  const cancelBtn = document.querySelector(".cancel-btn")
  const tomatoEditBtn = document.querySelector(".tomato-list .edit-btn")

  render()

  addIpt.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
      //先获取
      const arrStr = localStorage.getItem("todolist")
      const arr = JSON.parse(arrStr) || []

      //添加到localStorage
      const item = new Item(addIpt.value)
      arr.push(item)
      localStorage.setItem("todolist", JSON.stringify(arr))

      //渲染
      render()

      //清空
      addIpt.value = ""
    }
  })

  listBox.addEventListener("click", function (e) {
    // 删除事件,删除确认弹窗
    if (e.target.className.includes("del-btn")) {
      mask.classList.add("show")
      confirmBtn.dataset.timeStamp = e.target.parentNode.parentNode.parentNode.dataset.timeStamp
      e.stopPropagation()
    }

    // 完成事件
    if (e.target.classList.contains("complete-btn")) {
      const arrStr = localStorage.getItem("todolist")
      const arr = JSON.parse(arrStr) || []

      arr.forEach((item) => {
        if (item.timeStamp == e.target.parentNode.parentNode.dataset.timeStamp) {
          item.complete = !item.complete
        }
      })

      localStorage.setItem("todolist", JSON.stringify(arr))

      render()

      e.stopPropagation()
    }
  })

  // 番茄点击事件
  listBox.addEventListener("click", function (e) {

    if (
      (e.target.classList.contains("tomato") || e.target.classList.contains("tomato-first")) &&
      e.target.parentNode.classList.contains("active")
    ) {
      // 获取被点击的dd元素
      const ddEle = e.target.parentNode.parentNode.parentNode

      // 先移除该dd下所有active
      const tomatoActives = ddEle.querySelectorAll(".tomato-list .tomato.active")
      tomatoActives.forEach((ele) => {
        ele.classList.remove("active")
      })

      // 再添加active
      let preEl = e.target
      while (preEl) {
        preEl.classList.add("active")
        preEl = preEl.previousElementSibling
      }

      // 再修改localStorage的tomatoNum
      const arrStr = localStorage.getItem("todolist")
      const arr = JSON.parse(arrStr)

      arr.forEach(item => {
        if (item.timeStamp == ddEle.dataset.timeStamp) {
          item.tomatoNum = ddEle.querySelectorAll(".tomato-list .tomato.active").length
        }
      })

      // 重新落入localStorage
      localStorage.setItem("todolist", JSON.stringify(arr))
    }
  })

  // 确认删除
  confirmBtn.addEventListener("click", function (e) {
    const arrStr = localStorage.getItem("todolist")
    const arr = JSON.parse(arrStr) || []

    arr.forEach((item, index) => {
      if (item.timeStamp == e.target.dataset.timeStamp) {
        arr.splice(index, 1)
      }
    })

    localStorage.setItem("todolist", JSON.stringify(arr))

    mask.classList.remove("show")

    render()

    e.stopPropagation()
  })

  // 取消删除
  cancelBtn.addEventListener("click", function () {
    mask.classList.remove("show")
  })

  // 是否可编辑按钮
  listBox.addEventListener("click", function (e) {
    if (e.target.classList.contains("edit-btn")) {
      if (e.target.innerText === "编辑") {
        e.target.parentNode.parentNode.classList.add("active")
        e.target.innerText = "确认"
      } else {
        e.target.parentNode.parentNode.classList.remove("active")
        e.target.innerText = "编辑"
      }
    }
  })

  // 组织默认行为
  tomatoEditBtn.addEventListener("click", e => e.preventDefault())



  //构造函数
  function Item(content) {
    this.timeStamp = Date.now()
    this.content = content
    this.complete = false
    this.tomatoNum = 0
  }


  // 根据localStorage渲染
  function render() {
    const arrStr = localStorage.getItem("todolist")
    let newArr = groupByDate(JSON.parse(arrStr))
    if (newArr === undefined) return

    newArr.sort(function (a, b) {
      return b[0].timeStamp - a[0].timeStamp
    })

    const contentEle = document.querySelector(".todolist-content")
    const newContentEle = document.createElement("dl")
    newContentEle.classList.add("todolist-content")

    newArr.forEach((items) => {
      const itemDiv = document.createElement("div")
      itemDiv.classList.add("todolist-item")

      newContentEle.appendChild(itemDiv)

      const dtEle = document.createElement("dt")
      dtEle.innerText = items[0].date
      itemDiv.appendChild(dtEle)

      items.forEach((item) => {
        const ddEle = document.createElement("dd")

        ddEle.dataset.timeStamp = item.timeStamp

        // 构建内容区
        const contentSpanEle = document.createElement("span")
        contentSpanEle.innerText = item.content

        // 创建脚标div
        const footerEle = document.createElement("div")
        footerEle.classList.add("footer")

        // 创建番茄ul
        const tomatoUlEle = document.createElement("ul")
        tomatoUlEle.classList.add("tomato-list")

        footerEle.appendChild(tomatoUlEle)

        // 创建一个用来置为空
        const tomatoFirstLi = document.createElement("li")
        tomatoFirstLi.classList.add("tomato-first")
        tomatoUlEle.appendChild(tomatoFirstLi)

        // 创建5个具体番茄li, 并给激活数上active
        let tomatoActiveNum = item.tomatoNum
        let tomatoNotActiveNum = 5 - tomatoActiveNum
        // 渲染激活的
        for (let i = 0; i < tomatoActiveNum; i++) {
          const tomatoLi = document.createElement("li")
          tomatoLi.classList.add("tomato", "active")
          tomatoUlEle.appendChild(tomatoLi)
        }
        // 渲染未激活的
        for (let i = 0; i < tomatoNotActiveNum; i++) {
          const tomatoLi = document.createElement("li")
          tomatoLi.classList.add("tomato")
          tomatoUlEle.appendChild(tomatoLi)
        }
        // tomato编辑按钮
        const tomatoEditLi = document.createElement("li")
        const tomatoEditA = document.createElement("a")
        tomatoEditA.href = "#"
        tomatoEditA.classList.add("edit-btn")
        tomatoEditA.innerText = "编辑"

        tomatoEditLi.appendChild(tomatoEditA)
        tomatoUlEle.appendChild(tomatoEditLi)

        // 创建操作div
        const operateEle = document.createElement("div")

        footerEle.appendChild(operateEle)

        // 创建删除按钮
        const aDelEle = document.createElement("a")
        aDelEle.classList.add("del-btn")
        aDelEle.innerText = "删除"

        // 创建完成按钮
        const aCopEle = document.createElement("a")
        aCopEle.classList.add("complete-btn")
        if (item.complete) {
          contentSpanEle.classList.add("f-del")
          aCopEle.innerText = "取消"
        } else {
          aCopEle.innerText = "完成"
        }

        // 将操作按钮塞到操作span
        operateEle.appendChild(aCopEle)
        operateEle.appendChild(aDelEle)

        // 将contentSpan和footer塞到dd
        ddEle.appendChild(contentSpanEle)
        ddEle.appendChild(footerEle)

        itemDiv.appendChild(ddEle)
      })

    })

    contentEle.replaceWith(newContentEle)

  }

  function formatDate(timeStamp) {
    const date = new Date(timeStamp)
    let M = (date.getMonth() + 1)
    M = M > 9 ? M : "0" + M
    let d = date.getDate()
    d = d > 9 ? d : "0" + d
    return date.getFullYear() + "-" + M + "-" + d
  }

  function groupByDate(arr) {
    const groupKey = {}
    if (arr === null) return
    arr.forEach(item => {
      item.date = formatDate(item.timeStamp)
      groupKey[item.date] = groupKey[item.date] || []
      groupKey[item.date].push(item)
    });
    return Object.keys(groupKey).map(k => {
      return groupKey[k]
    })
  }
})

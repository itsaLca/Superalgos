 ﻿/*

The Panel Space y the place wehre all panels live, no matter who create them.

*/

function newPanelsSpace () {
  let thisObject = {
    visible: true,
    container: undefined,
    makeVisible: makeVisible,
    makeInvisible: makeInvisible,
    createNewPanel: createNewPanel,
    destroyPanel: destroyPanel,
    getPanel: getPanel,
    physics: physics,
    draw: draw,
    panels: [],
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container
  thisObject.container.isDraggeable = false

  container.frame.containerName = 'Panels Space'

  return thisObject

  function initialize () {

        /* The space does not create any Panels for itself, it just sits and waits others need panels. */

  }

  function createNewPanel (pType, pParameters, pOwner, pSession) {
    let panel

    switch (pType) {

      case 'Layers Panel':
        {
          panel = newLayersPanel()
          panel.fitFunction = canvas.chartSpace.fitFunction
          panel.container.isVisibleFunction = canvas.chartSpace.isThisPointVisible
          panel.type = 'Layers Panel'
          break
        }
      case 'Plotter Panel':
        {
          if (pParameters.panelNode.code.isLegacy !== true) {
            panel = newPlotterPanel()
            panel.fitFunction = canvas.chartSpace.fitFunction
            panel.container.isVisibleFunction = canvas.chartSpace.isThisPointVisible
            panel.session = pSession
            panel.initialize(pParameters.panelNode)
          } else {
            panel = getNewPlotterPanel(pParameters.dataMine, pParameters.plotterCodeName, pParameters.moduleCodeName, pParameters.panelNode.code.codeName)
            panel.fitFunction = canvas.chartSpace.fitFunction
            panel.container.isVisibleFunction = canvas.chartSpace.isThisPointVisible
            panel.session = pSession
            panel.initialize()
          }
          panel.type = 'Plotter Panel'
          break
        }
    }

    panel.owner = pOwner
    thisObject.panels.push(panel)

    panel.handle = Math.floor((Math.random() * 10000000) + 1)

    return panel.handle
  }

  function makeVisible (owner, type) {
    for (let i = 0; i < thisObject.panels.length; i++) {
      let panel = thisObject.panels[i]
      if (panel.owner === owner && panel.type === type) {
        panel.isVisible = true
      }
    }
  }

  function makeInvisible (owner, type) {
    for (let i = 0; i < thisObject.panels.length; i++) {
      let panel = thisObject.panels[i]
      if (panel.owner === owner && panel.type === type) {
        panel.isVisible = false
      }
    }
  }

  function destroyPanel (pPanelHandle) {
    for (let i = 0; i < thisObject.panels.length; i++) {
      let panel = thisObject.panels[i]

      if (panel.handle === pPanelHandle) {
        if (panel.finalize !== undefined) {
          panel.finalize()
        }

        thisObject.panels.splice(i, 1)  // Delete item from array.
        return
      }
    }
  }

  function getPanel (pPanelHandle) {
    for (let i = 0; i < thisObject.panels.length; i++) {
      let panel = thisObject.panels[i]

      if (panel.handle === pPanelHandle) {
        return panel
      }
    }
  }

  function physics () {
    if (thisObject.visible !== true) { return }

    childrenPhysics()
    positioningPhysics()
  }

  function childrenPhysics () {
    if (thisObject.panels !== undefined) {
      for (let i = 0; i < thisObject.panels.length; i++) {
        let panel = thisObject.panels[i]
        let owner = canvas.chartSpace.inViewport.get(panel.owner)
        if (owner !== undefined) {
          if (panel.physics !== undefined) {
            panel.physics()
          }
        }
      }
    }
  }

  function positioningPhysics () {
    if (thisObject.panels !== undefined) {
      for (let i = 0; i < thisObject.panels.length; i++) {
        let panel = thisObject.panels[i]

        /* setting the speed of the panel */
        if (panel.container.speed === undefined) {
          panel.container.speed = {
            x: 2,
            y: 2
          }
        }

        /* Trying to move the panel and see if it is possible */
        let centerPoint = {
          x: panel.container.frame.position.x,
          y: panel.container.frame.position.y
        }
        centerPoint.x = centerPoint.x + panel.container.frame.width / 2
        centerPoint.y = centerPoint.y + panel.container.frame.height / 2

        /* Lets see which quadrant the panel is at */
        let verticalLine = (canvas.chartSpace.viewport.visibleArea.topRight.x - canvas.chartSpace.viewport.visibleArea.topLeft.x) / 2 + canvas.chartSpace.viewport.visibleArea.topLeft.x
        let horizontalLine = (canvas.chartSpace.viewport.visibleArea.bottomRight.y - canvas.chartSpace.viewport.visibleArea.topRight.y) / 2 + canvas.chartSpace.viewport.visibleArea.topRight.y

        if (panel.panelTabButton !== undefined) {
          if (panel.panelTabButton.status === 'up') {
            if (centerPoint.x < verticalLine) {
              panel.gravitatesTowards = 'topLeft'
            } else {
              panel.gravitatesTowards = 'topRight'
            }
          } else {
            if (centerPoint.x < verticalLine) {
              panel.gravitatesTowards = 'bottomLeft'
            } else {
              panel.gravitatesTowards = 'bottomRight'
            }
          }
        } else {
          if (centerPoint.x < verticalLine && centerPoint.y < horizontalLine) {
            panel.gravitatesTowards = 'topLeft'
          }
          if (centerPoint.x >= verticalLine && centerPoint.y < horizontalLine) {
            panel.gravitatesTowards = 'topRight'
          }
          if (centerPoint.x < verticalLine && centerPoint.y >= horizontalLine) {
            panel.gravitatesTowards = 'bottomLeft'
          }
          if (centerPoint.x >= verticalLine && centerPoint.y >= horizontalLine) {
            panel.gravitatesTowards = 'bottomRight'
          }
        }

        /* According to the quadrant we push the panels to the sides */
        if (panel.gravitatesTowards === 'topLeft' || panel.gravitatesTowards === 'bottomLeft') {
          panel.container.frame.position.x = panel.container.frame.position.x - panel.container.speed.x
          isOverlapping(i, panel.container)
          if (panel.container.frame.position.x < 0) {
            panel.container.frame.position.x = 0
          }
        } else {
          panel.container.frame.position.x = panel.container.frame.position.x + panel.container.speed.x
          isOverlapping(i, panel.container)
          if (panel.container.frame.position.x + panel.container.frame.width > browserCanvas.width) {
            panel.container.frame.position.x = browserCanvas.width - panel.container.frame.width
          }
        }
        if (panel.container.frame.height <= canvas.chartSpace.viewport.visibleArea.bottomRight.y - canvas.chartSpace.viewport.visibleArea.topRight.y) {
          if (panel.gravitatesTowards === 'topLeft' || panel.gravitatesTowards === 'topRight') {
            panel.container.frame.position.y = panel.container.frame.position.y - panel.container.speed.y
            isOverlapping(i, panel.container)
            if (panel.container.frame.position.y < canvas.chartSpace.viewport.visibleArea.topLeft.y) {
              panel.container.frame.position.y = canvas.chartSpace.viewport.visibleArea.topLeft.y
            }
          } else {
            panel.container.frame.position.y = panel.container.frame.position.y + panel.container.speed.y
            isOverlapping(i, panel.container)
            if (panel.container.frame.position.y + panel.container.frame.height > canvas.chartSpace.viewport.visibleArea.bottomRight.y) {
              panel.container.frame.position.y = canvas.chartSpace.viewport.visibleArea.bottomRight.y - panel.container.frame.height
            }
          }
        }
      }
    }

    function isOverlapping (currentIndex, currentContainer) {
      let corner1 = {
        x: currentContainer.frame.position.x,
        y: currentContainer.frame.position.y
      }
      let corner2 = {
        x: currentContainer.frame.position.x + currentContainer.frame.width,
        y: currentContainer.frame.position.y
      }
      let corner3 = {
        x: currentContainer.frame.position.x + currentContainer.frame.width,
        y: currentContainer.frame.position.y + currentContainer.frame.height
      }
      let corner4 = {
        x: currentContainer.frame.position.x,
        y: currentContainer.frame.position.y + currentContainer.frame.height
      }

      for (let i = 0; i < currentIndex; i++) {
        let panel = thisObject.panels[i]
        if (panel.isVisible === true) {
          if (isThisPointInsideThisFrame(corner1, panel.container.frame) === true) {
            pushOut(currentContainer, panel.container, panel.gravitatesTowards)
          }
          if (isThisPointInsideThisFrame(corner2, panel.container.frame) === true) {
            pushOut(currentContainer, panel.container, panel.gravitatesTowards)
          }
          if (isThisPointInsideThisFrame(corner3, panel.container.frame) === true) {
            pushOut(currentContainer, panel.container, panel.gravitatesTowards)
          }
          if (isThisPointInsideThisFrame(corner4, panel.container.frame) === true) {
            pushOut(currentContainer, panel.container, panel.gravitatesTowards)
          }
        }
      }

      function pushOut (currentContainer, controlContainer, corner) {
        switch (corner) {
          case 'topLeft': {
            currentContainer.frame.position.x = controlContainer.frame.position.x + controlContainer.frame.width
            break
          }
          case 'topRight': {
            currentContainer.frame.position.x = controlContainer.frame.position.x - currentContainer.frame.width
            break
          }
          case 'bottomLeft': {
            currentContainer.frame.position.x = controlContainer.frame.position.x + controlContainer.frame.width
            break
          }
          case 'bottomRight': {
            currentContainer.frame.position.x = controlContainer.frame.position.x - currentContainer.frame.width
            break
          }
        }
      }

      function isThisPointInsideThisFrame (point, frame) {
        let corner1 = {
          x: frame.position.x,
          y: frame.position.y
        }
        let corner2 = {
          x: frame.position.x + frame.width,
          y: frame.position.y
        }
        let corner3 = {
          x: frame.position.x + frame.width,
          y: frame.position.y + frame.height
        }
        let corner4 = {
          x: frame.position.x,
          y: frame.position.y + frame.height
        }
        if (point.x >= corner1.x && point.y >= corner1.y && point.x <= corner3.x && point.y <= corner3.y) {
          return true
        } else {
          return false
        }
      }
      return false
    }
  }

  function draw () {
    if (thisObject.visible !== true) { return }

    thisObject.container.frame.draw(false, false)

    for (let i = 0; i < thisObject.panels.length; i++) {
      let panel = thisObject.panels[i]
      let owner = canvas.chartSpace.inViewport.get(panel.owner)
      if (owner !== undefined) {
        panel.draw()
      }
    }
  }

  function getContainer (point) {
    if (thisObject.visible !== true) { return }

    let container
      /*
      We search for the container of panels in the oposite direction than we do it for drawing them,
      so panels overlapping others are picked firt although they are drawn last.
      */
    for (let i = thisObject.panels.length - 1; i >= 0; i--) {
      let panel = thisObject.panels[i]
      let owner = canvas.chartSpace.inViewport.get(panel.owner)
      if (owner !== undefined) {
        container = panel.getContainer(point)
      }
      if (container !== undefined) {
        return container
      }
    }
    return thisObject.container
  }
}
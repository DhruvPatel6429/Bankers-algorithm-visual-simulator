#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Extend existing Banker's Algorithm simulator with three new features:
  1. Export/Import System State - Save and load system configurations as JSON
  2. Guided Tutorial Mode - Step-by-step educational overlay
  3. Side-by-Side Scenario Comparison - Compare two independent scenarios

frontend:
  - task: "Feature Flags Configuration"
    implemented: true
    working: true
    file: "/app/frontend/src/config/features.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Created feature flags for exportImport, tutorialMode, and comparisonMode"

  - task: "State Validation Utilities"
    implemented: true
    working: true
    file: "/app/frontend/src/utils/stateValidation.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Added isValidBankerState and cloneBankerState utilities with comprehensive validation"

  - task: "Export/Import UI Integration"
    implemented: true
    working: "needs_testing"
    file: "/app/frontend/src/components/ConfigurationPanel.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "needs_testing"
        agent: "main"
        comment: "Added Export/Import buttons to ConfigurationPanel with state validation before import"

  - task: "Tutorial Context & State Machine"
    implemented: true
    working: "needs_testing"
    file: "/app/frontend/src/contexts/TutorialContext.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "needs_testing"
        agent: "main"
        comment: "Created TutorialContext with state machine (overview → matrices → safety → request → outcome → completed)"

  - task: "Tutorial Overlay Component"
    implemented: true
    working: "needs_testing"
    file: "/app/frontend/src/components/TutorialOverlay.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "needs_testing"
        agent: "main"
        comment: "Created TutorialOverlay with step navigation, escape key handling, and TutorialToggle button"

  - task: "Tutorial Mode - Edit Locking"
    implemented: true
    working: "needs_testing"
    file: "/app/frontend/src/pages/BankerDashboard.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "needs_testing"
        agent: "main"
        comment: "Matrix and vector editing disabled during tutorial mode via editable prop"

  - task: "Scenario Comparison Component"
    implemented: true
    working: "needs_testing"
    file: "/app/frontend/src/components/ScenarioComparison.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "needs_testing"
        agent: "main"
        comment: "Created side-by-side comparison with isolated BankerProvider contexts and independent chart instances"

  - task: "App Integration - Tutorial & Comparison"
    implemented: true
    working: "needs_testing"
    file: "/app/frontend/src/App.js, /app/frontend/src/pages/BankerDashboard.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: "needs_testing"
        agent: "main"
        comment: "Integrated TutorialProvider and added tutorial/comparison toggle buttons to dashboard header"

backend:
  - task: "No backend changes required"
    implemented: true
    working: "NA"
    file: "NA"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "All features are frontend-only, no backend modifications needed"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 0
  run_ui: true

test_plan:
  current_focus:
    - "Export/Import UI Integration"
    - "Tutorial Mode Flow"
    - "Scenario Comparison Isolation"
  stuck_tasks: []
  test_all: true
  test_priority: "sequential"

agent_communication:
  - agent: "main"
    message: |
      Implemented three new features for Banker's Algorithm simulator:
      
      ✅ Feature 1: Export/Import System State
      - Added Export/Import buttons to ConfigurationPanel
      - State validation using isValidBankerState before import
      - Routes through Context importState action (no direct mutation)
      
      ✅ Feature 2: Guided Tutorial Mode
      - Tutorial state machine: overview → matrices → safety → request → outcome → completed
      - TutorialOverlay component with navigation and escape key support
      - Matrix editing locked during tutorial (editable={!isTutorialActive})
      - Educational content for each step
      
      ✅ Feature 3: Side-by-Side Scenario Comparison
      - Two isolated BankerProvider contexts (no shared state)
      - Each scenario has independent chart instances
      - ComparisonModeToggle button in header
      - Full-screen comparison view with side-by-side panels
      
      All features follow recommendations:
      - Feature flags in config/features.js
      - State validation before commits
      - Tutorial uses state machine (not conditionals)
      - Scenarios have isolated contexts (no chart sharing)
      
      Ready for frontend testing.
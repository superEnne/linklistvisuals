import React, { useState, useEffect } from 'react';
import { Play, Plus, Trash2, Search, ArrowRight, ArrowLeftRight, ChevronRight, ArrowDown, RefreshCw, Settings, Hash, Key, LogOut, Menu, ArrowLeft, Check, X, Ban, RotateCw } from 'lucide-react';

/**
 * Linked List Visualizer
 * Strictly mapped to CC4CASESTUD.py structure and algorithms.
 */

// --- Constants --- 
const SPEED = 800; 
const THEME = {
  bg: "bg-slate-950",
  panel: "bg-slate-900",
  primary: "bg-purple-600",
  node: "bg-violet-700",
  nodeBorder: "border-violet-400",
  highlight: "bg-pink-600 border-pink-400 scale-110",
  success: "bg-green-600 border-green-400",
};

// --- Components ---

const NullBlock = () => (
    <div className="flex flex-col items-center justify-center mx-1">
        <div className="w-10 h-10 border-2 border-slate-700 border-dashed rounded flex items-center justify-center text-[10px] text-slate-500 font-bold bg-slate-900/50">
            NULL
        </div>
    </div>
);

const Node = ({ value, isHighlighted, isFound, hasNext, type, pointers, isLast, isFirst, isSelfPointing }) => {
  return (
    <div className="relative flex items-center">
        
      {/* For Doubly: Prev pointer to NULL for Head */}
      {type === 'doubly' && isFirst && (
          <div className="flex items-center mr-2">
            <NullBlock />
            <div className="w-6 h-1 bg-slate-700 relative">
                <div className="absolute left-0 -top-1.5"><ChevronRight size={16} className="text-slate-700 transform rotate-180"/></div>
            </div>
          </div>
      )}

      {/* Node Circle */}
      <div 
        className={`
          relative z-10 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-lg border-2 transition-all duration-500
          ${isFound ? THEME.success : (isHighlighted ? THEME.highlight : `${THEME.node} ${THEME.nodeBorder}`)}
        `}
      >
        {value}
        {/* Pointer Labels (e.g. HEAD, TEMP, CURR) */}
        <div className="absolute -top-10 md:-top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 w-max pointer-events-none">
            {pointers.map((p, idx) => (
                <div key={idx} className="bg-white text-purple-900 text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded shadow-md animate-bounce" style={{ animationDelay: `${idx * 100}ms` }}>
                    {p}
                </div>
            ))}
        </div>

        {/* Self Pointer Loop (Visualizing next -> self for Circular 1-node) */}
        {isSelfPointing && (
            <div className="absolute -right-6 -top-6 w-10 h-10 border-t-2 border-r-2 border-purple-400 rounded-tr-full transform -rotate-12 pointer-events-none">
                <div className="absolute -right-1.5 top-full mt-0"><ArrowDown size={14} className="text-purple-400"/></div>
                <span className="absolute -top-3 right-0 text-[9px] text-purple-300 font-mono">next</span>
            </div>
        )}
      </div>

      {/* Connections */}
      {hasNext ? (
        <div className="w-10 md:w-16 h-8 flex items-center justify-center relative">
          <div className="h-1 w-full bg-slate-600"></div>
          <div className="absolute right-0 text-slate-500">
            {type.includes('doubly') ? <ArrowLeftRight size={16} className="md:w-5 md:h-5" /> : <ChevronRight size={20} className="md:w-6 md:h-6" />}
          </div>
        </div>
      ) : (
          // Last Node Connections to NULL (if not circular)
          (!type.includes('circular')) && (
            <div className="flex items-center ml-0">
                <div className="w-8 md:w-10 h-8 flex items-center justify-center relative">
                    <div className="h-1 w-full bg-slate-600"></div>
                    <div className="absolute right-0 text-slate-500">
                        <ChevronRight size={20} className="md:w-6 md:h-6" />
                    </div>
                </div>
                <NullBlock />
            </div>
          )
      )}
    </div>
  );
};

const CircularConnector = () => (
    <div className="absolute bottom-0 left-6 right-12 md:left-8 md:right-16 h-16 md:h-24 pointer-events-none opacity-40 border-b-4 border-l-4 border-r-4 border-dashed border-purple-500 rounded-b-3xl flex justify-center items-end pb-2">
      <div className="absolute -left-3 -top-2"><ArrowDown className="transform rotate-180 text-purple-500" /></div>
      <div className="absolute -right-3 -top-2"><ArrowDown className="transform rotate-180 text-purple-500" /></div>
      <span className="text-purple-400 text-[10px] md:text-xs bg-slate-900 px-2 -mb-3">Circular</span>
    </div>
);

export default function LinkedListGUI() {
  // --- View State ---
  const [view, setView] = useState('MAIN'); // MAIN, APP, EXIT
  const [listType, setListType] = useState('singly');
  
  // --- Data State ---
  const [nodes, setNodes] = useState([]);
  
  // Setup State
  const [appPhase, setAppPhase] = useState('SETUP_COUNT'); // SETUP_COUNT, SETUP_VALUES, READY
  const [nodesToCreate, setNodesToCreate] = useState(0);
  const [createdCount, setCreatedCount] = useState(0);
  
  // Simulation State
  const [isAnimating, setIsAnimating] = useState(false);
  // Using a generic object for pointers to allow 'temp', 'p', 'q', 'curr', 'prev' etc.
  const [pointers, setPointers] = useState({}); 
  const [foundIndex, setFoundIndex] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Operational State
  const [pendingOp, setPendingOp] = useState(null); // { label, action, req }
  const [opInputs, setOpInputs] = useState({ val: '', key: '', pos: '' });
  const [setupInput, setSetupInput] = useState('');

  // --- Helpers ---
  const log = (msg) => setLogs(prev => [...prev.slice(-5), msg]);
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const resetSim = () => { setPointers({}); setFoundIndex(null); };
  
  // Helper to finish animation and clear pointers
  const endOp = () => {
      setPointers({});
      setIsAnimating(false);
  };

  // --- Menu Navigation ---
  const enterListMode = (type) => {
    setListType(type);
    setNodes([]);
    setAppPhase('SETUP_COUNT');
    setNodesToCreate(0);
    setCreatedCount(0);
    setSetupInput('');
    setPendingOp(null);
    setLogs([`Initializing ${type.replace('-', ' ')}...`]);
    setView('APP');
  };

  const exitApp = () => {
    setView('EXIT');
  };

  const backToMain = () => {
    setView('MAIN');
    setLogs([]);
  };

  // --- Initialization Logic ---
  const submitNodeCount = () => {
    const c = parseInt(setupInput);
    if (!c || c <= 0) return log("Error: Enter positive integer.");
    setNodesToCreate(c); 
    setCreatedCount(0); 
    setNodes([]); 
    setAppPhase('SETUP_VALUES'); 
    setSetupInput('');
    log(`Plan: Create ${c} nodes.`);
  };

  const submitNodeValue = () => {
    const v = parseInt(setupInput);
    if (isNaN(v)) return log("Error: Enter integer.");
    setNodes(prev => [...prev, { id: Date.now(), value: v }]);
    const next = createdCount + 1;
    setCreatedCount(next); 
    setSetupInput('');
    if (next >= nodesToCreate) {
        setAppPhase('READY');
        log("Initialization Complete. ADT Ready.");
    } else {
        log(`Node ${next} created. Enter next.`);
    }
  };

  // --- Operation Handling ---
  const handleOpClick = (op) => {
      if (op.req.length === 0) {
          op.action();
      } else {
          setOpInputs({ val: '', key: '', pos: '' }); 
          setPendingOp(op);
      }
  };

  const confirmOp = () => {
      if (!pendingOp) return;
      
      let val = null, key = null, pos = null;

      // Validation Logic
      if (pendingOp.req.includes('val')) {
          if (!/^-?\d+$/.test(opInputs.val)) {
              log("Invalid input. Please enter an integer.");
              return;
          }
          val = parseInt(opInputs.val);
      }

      if (pendingOp.req.includes('key')) {
          if (!/^-?\d+$/.test(opInputs.key)) {
              log("Invalid input. Please enter an integer for Key.");
              return;
          }
          key = parseInt(opInputs.key);
      }

      if (pendingOp.req.includes('pos')) {
          if (!/^\d+$/.test(opInputs.pos)) { 
               log("Invalid input. Position must be a positive integer.");
               return;
          }
          pos = parseInt(opInputs.pos);
          if (pos <= 0) {
              log("Position must be a positive integer.");
              return;
          }
      }

      pendingOp.action(val, key, pos);
      setPendingOp(null);
  };

  const cancelOp = () => {
      setPendingOp(null);
  };

  const clearList = () => {
      if (isAnimating) return;
      setNodes([]);
      resetSim();
      log("List Cleared (Empty).");
  };


  // ==========================================
  // --- 1. SINGLY LINKED LIST OPERATIONS ---
  // ==========================================

  const insertHeadSingly = async (val) => {
    /**
     * Algorithm for Inserting a Node at the Beginning:
     * 1. Create a new node with the given data.
     * 2. Update the next pointer of the new node to point to the current head.
     * 3. Update the head pointer to point to the new node.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("1. Insert Start (Singly)");
    
    // VISUAL: Animate creation of temp/new node
    log(`Step 1: Create a new node with data [${val}].`);
    
    setNodes([{ id: Date.now(), value: val }, ...nodes]);
    setPointers({ new_node: 0, head: 1 }); // Point new_node to 0, old head at 1
    await wait(SPEED);

    log("Step 2: Update next pointer of new node to point to current head.");
    // Visualized by the link appearance
    await wait(SPEED);

    log("Step 3: Update head pointer to point to the new node.");
    setPointers({ head: 0 }); // Head moves to 0
    await wait(SPEED);
    
    endOp();
  };

  const insertTailSingly = async (val) => {
    /**
     * Algorithm for Inserting a Node at the Ending:
     * 1. Create a new node.
     * 2. If the Linked List is empty, make the new node as the head and return.
     * 3. Traverse the list until the last node (where next is NULL).
     * 4. Change the next pointer of the last node to point to the new node.
     * 5. Set the next pointer of the new node to NULL.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("2. Insert End (Singly)");
    log(`Step 1: Create a new node [${val}].`);
    
    if (nodes.length === 0) {
        log("Step 2: List is empty. Make new node as Head.");
        setNodes([{ id: Date.now(), value: val }]);
        await wait(SPEED);
        endOp();
        return;
    }

    log("Step 3: Traverse the list until the last node.");
    for(let i=0; i<nodes.length; i++) { 
        setPointers({last: i}); // Variable name from algorithm
        await wait(SPEED/4); 
    }
    
    log("Step 4 & 5: Change next of last node to point to new node.");
    setNodes([...nodes, { id: Date.now(), value: val }]);
    // last pointer is still at what was the last node
    await wait(SPEED);
    
    endOp();
  };

  const insertBeforeKeySingly = async (val, key) => {
    /**
     * Algorithm for Inserting a Middle Node (Before a Given Node):
     * 1. Check if the head is NULL (Base Case). If so, return NULL.
     * 2. Check if the current node's data matches the key.
     * 3. If it matches, create a new node, point its next to the current node, and return the new node.
     * 4. If it does not match, recursively call the function for the next node (head.next).
     * 5. Link the result of the recursive call back to the current node's next pointer.
     * 6. Return the current head.
     */
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }
    
    setIsAnimating(true); resetSim();
    log("3. Insert Before Key (Singly)");
    
    // Simulating the recursive search or iterative search
    log(`Step 2: Check if nodes match Key ${key}.`);
    let foundIdx = -1;
    for(let i=0; i<nodes.length; i++) {
        setPointers({curr: i}); // Visualizing current node being checked
        if (nodes[i].value === key) { foundIdx = i; break; }
        await wait(SPEED/2);
    }

    if (foundIdx === -1) {
        log(`Key ${key} not found.`);
    } else {
        log("Step 3: Match found. Create new node.");
        log("Step 5: Link previous/new pointers.");
        const newArr = [...nodes];
        newArr.splice(foundIdx, 0, { id: Date.now(), value: val });
        setNodes(newArr);
        await wait(SPEED);
    }
    endOp();
  };

  const insertAfterKeySingly = async (val, key) => {
    /**
     * Algorithm for Inserting a Middle Node (After a Given Node):
     * 1. Initialize a temporary pointer to traverse the list.
     * 2. Traverse the list to find the node containing the key.
     * 3. If the key is not found, print a message and return.
     * 4. Create a new node with the new data.
     * 5. Set the next pointer of the new node to point to the successor of the current node.
     * 6. Set the next pointer of the current node to point to the new node.
     */
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }

    setIsAnimating(true); resetSim();
    log("4. Insert After Key (Singly)");
    
    log(`Step 1: Initialize temporary pointer.`);
    log(`Step 2: Traverse to find Key ${key}.`);
    
    let foundIdx = -1;
    for(let i=0; i<nodes.length; i++) {
        setPointers({temp: i}); // Using 'temp' as per algo description "temporary pointer"
        if (nodes[i].value === key) { foundIdx = i; break; }
        await wait(SPEED/2);
    }

    if (foundIdx === -1) {
        log(`Step 3: Key ${key} not found.`);
    } else {
        log("Step 4: Create a new node.");
        log("Step 5 & 6: Update pointers (new->next and curr->next).");
        const newArr = [...nodes];
        newArr.splice(foundIdx + 1, 0, { id: Date.now(), value: val });
        setNodes(newArr);
        await wait(SPEED);
    }
    endOp();
  };

  const deleteHeadSingly = async () => {
    /**
     * Algorithm for Deleting the First Node:
     * 1. Check if the list is empty. If yes, return.
     * 2. Create a temporary node which will point to the same node as that of head.
     * 3. Move the head pointer to the next node in the list.
     * 4. Dispose of the temporary node (or let Garbage Collector handle it).
     */
    if (isAnimating) return;
    if (nodes.length === 0) { log("List is empty, cannot delete."); return; }

    setIsAnimating(true); resetSim();
    log("5. Delete Head (Singly)");
    
    log("Step 2: Create a temporary node (TEMP) pointing to head.");
    setPointers({ temp: 0, head: 0 }); 
    await wait(SPEED);
    
    log("Step 3: Move the head pointer to the next node.");
    // In visualization, we assume the next node becomes 0 index visually after delete
    // But for the step, let's show head moving if there is a next node
    if (nodes.length > 1) {
        setPointers({ temp: 0, head: 1 });
        await wait(SPEED);
    }

    setNodes(nodes.slice(1));
    log("Step 4: Dispose of the temporary node.");
    endOp();
  };

  const deleteTailSingly = async () => {
    /**
     * Algorithm for Deleting the Last Node:
     * 1. Check if the list is empty. If yes, return.
     * 2. If the list has only one node, delete it (set head to NULL) and return.
     * 3. Traverse the list maintaining a pointer to the current node until you reach the second to last node (node.next.next is NULL).
     * 4. Update the second to last node's next pointer to NULL.
     * 5. Dispose of the last node (Handled by Garbage Collector).
     */
    if (isAnimating) return;
    if (nodes.length === 0) { log("List is empty, cannot delete."); return; }

    setIsAnimating(true); resetSim();
    log("6. Delete Tail (Singly)");
    
    if(nodes.length === 1) { 
        log("Step 2: Only one node. Delete it.");
        setNodes([]); 
        endOp(); 
        return; 
    }

    log("Step 3: Traverse to second to last node.");
    for(let i=0; i<nodes.length-1; i++) { 
        setPointers({curr: i}); // Visualizing traversal
        await wait(SPEED/4); 
    }
    // Now curr is at second to last
    log("Step 4: Update second to last node's next pointer to NULL.");
    setNodes(nodes.slice(0, -1));
    
    log("Step 5: Dispose of the last node.");
    endOp();
  };

  const deleteAtPosSingly = async (val, key, pos) => {
    /**
     * Algorithm for Deleting a Node at a Specific Position:
     * 1. Check if the list is empty.
     * 2. If position is 1, update head to head.next.
     * 3. Otherwise, traverse the list to find the node just BEFORE the position to be deleted.
     * 4. If the position is invalid (beyond list size), print error.
     * 5. Change the next pointer of the previous node to point to the next pointer of the node to be deleted.
     * 6. Dispose of the current node to be deleted.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty. Nothing to delete."); return; }
    if (idx < 0 || idx >= nodes.length) { log("Step 4: Invalid Position."); return; }
    
    setIsAnimating(true); resetSim();
    log("7. Delete At Position (Singly)");
    
    if (pos === 1) { await deleteHeadSingly(); return; }

    log(`Step 3: Traverse to node just BEFORE position.`);
    // Using 'prev' or 'temp' as per generic algorithm understanding
    let prevIndex = -1;
    for(let i=0; i<idx; i++) {
        prevIndex = i;
        setPointers({ prev: prevIndex }); // Showing the traversal pointer
        await wait(SPEED/2);
    }
    
    log("Step 5: Change next pointer of previous node.");
    setNodes(nodes.filter((_, idx) => idx !== pos-1));
    
    log("Step 6: Dispose of the deleted node.");
    endOp();
  };

  const retrieveAtPosSingly = async (val, key, pos) => {
    /**
     * Algorithm for Getting Retrieving:
     * 1. Initialize a pointer `current` to the head and a counter `count` to 1.
     * 2. Traverse the list while `current` is not NULL.
     * 3. In the loop, check if `count` equals the index `n`.
     * 4. If yes, return the data of the current node.
     * 5. If no, increment `count` and move `current` to the next node.
     * 6. If the loop ends without finding the index, return NULL.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }
    
    setIsAnimating(true); resetSim();
    log("8. Retrieval (Singly)");
    
    if (idx < 0 || idx >= nodes.length) {
        log(`Index ${pos} out of bounds.`);
        endOp();
        return;
    }
    
    log("Step 1: Initialize current=head, count=1");
    for (let i = 0; i <= idx; i++) {
        setPointers({ current: i }); // Explicitly using 'current'
        log(`Step 3: Checking count... (${i+1})`);
        await wait(SPEED/2);
    }
    
    log(`Step 4: Found. Data: ${nodes[idx].value}`);
    setFoundIndex(idx);
    endOp();
  };

  const traverseSingly = async () => {
    /**
     * Algorithm for Traversing:
     * 1. Initialize a temporary pointer to the head node of the linked list.
     * 2. Check if that pointer is null; if it is null, then return.
     * 3. While the pointer is not null, access and print the data of the current node.
     * 4. Move the pointer to next node and repeat step 3.
     */
    if (isAnimating) return; 
    setIsAnimating(true); resetSim();
    log("9. Traverse (Singly)");
    if (nodes.length === 0) {
        log("Step 2: Pointer is NULL. Return.");
        endOp();
        return;
    }
    log("Step 1: Initialize pointer to Head.");
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ temp: i }); // Using 'temp' as per algo text
        log(`Step 3: Print [${nodes[i].value}]`);
        await wait(SPEED);
        log("Step 4: Move pointer to next.");
    }
    endOp();
  };

  const getLengthSingly = async () => {
    /**
     * Algorithm for Finding Length of Linked List:
     * 1. Initialize count as 0.
     * 2. Initialize a node pointer, curr = head.
     * 3. While curr is not NULL:
     * - Increment count by 1.
     * - Move curr to the next node (curr = curr.next).
     * 4. Return count.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("10. Length (Singly)");
    let count = 0;
    log("Step 1: Initialize count as 0.");
    log("Step 2: Initialize curr = head.");
    
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        count++;
        log(`Step 3: Count = ${count}. Move curr.`);
        await wait(SPEED/2);
    }
    log(`Step 4: Return count (${count}).`);
    endOp();
  };

  const searchKeySingly = async (val, key) => {
    /**
     * Algorithm for Searching a Linked List:
     * 1. Initialize a node pointer, curr = head.
     * 2. While current is not NULL:
     * - If the current value (curr.data) is equal to the key being searched return true.
     * - Else, move to the next node (curr = curr.next).
     * 3. If the loop completes and key is not found, return false.
     */
    const target = key;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }

    setIsAnimating(true); resetSim();
    log("11. Search (Singly)");
    log(`Step 1: Initialize curr = head.`);
    let found = false;
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        if (nodes[i].value === target) {
            setFoundIndex(i);
            log(`Step 2: Value matches key! Return True.`);
            found = true;
            await wait(SPEED);
            break;
        }
        await wait(SPEED/2);
    }
    if (!found) log("Step 3: Loop completed. Key not found.");
    endOp();
  };

  const sortSingly = async () => {
    /**
     * Algorithm for Sorting the Linked List:
     * 1. Initialize a pointer `p` to the head of the list.
     * 2. Start an outer loop that runs until `p` is NULL.
     * 3. Inside the outer loop, initialize a pointer `q` to the node next to `p` (`p->next`).
     * 4. Start an inner loop that runs until `q` is NULL.
     * 5. Compare the data of node `p` and node `q`.
     * 6. If the data in `q` is less than the data in `p`, swap the data values of these two nodes.
     * (Note: Only data is swapped, link pointers remain unchanged).
     * 7. Move `q` to the next node.
     * 8. After the inner loop finishes, move `p` to the next node.
     */
    if (nodes.length < 2 || isAnimating) return;
    setIsAnimating(true); resetSim();
    log("12. Sort (Singly)");
    let arr = [...nodes];
    let swapped;
    
    // We visualize Selection/Bubble hybrid logic to show 'p' and 'q' comparing
    // Actually the python algo looks like simple bubble sort with data swapping
    for (let i = 0; i < arr.length; i++) {
        // Step 1: p = head (in visualization i represents p)
        for (let j = i + 1; j < arr.length; j++) {
            // Step 3: q = p->next (in visualization j represents q)
            setPointers({ p: i, q: j });
            await wait(SPEED/2);
            
            // Step 5: Compare data
            if (arr[i].value > arr[j].value) {
                log(`Step 6: Swap data ${arr[j].value} < ${arr[i].value}`);
                let temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
                setNodes([...arr]);
                await wait(SPEED);
            }
            // Step 7: Move q next (loop handles this)
        }
        // Step 8: Move p next (loop handles this)
    }
    
    log("Sorting finished.");
    endOp();
  };


  // ==========================================
  // --- 2. DOUBLY LINKED LIST OPERATIONS ---
  // ==========================================

  const insertHeadDoubly = async (val) => {
    /**
     * Algorithm for Inserting a Node at the Beginning (Doubly Linked List):
     * 1. Create a new node with the given data.
     * 2. Update the right pointer (next) of the new node to point to the current head node
     * and make the left pointer (prev) of the new node NULL.
     * 3. If the current head is not NULL, update the head node's left pointer (prev) to point to the new node.
     * 4. Update the head pointer to point to the new node.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("1. Insert Beginning (Doubly)");
    log(`Step 1: Create a new node [${val}].`);
    await wait(SPEED);
    log("Step 2: Update next of new node to Head, prev to NULL.");
    log("Step 3: If Head exists, update Head.prev to new node.");
    log("Step 4: Update Head pointer to point to new node.");
    setNodes([{ id: Date.now(), value: val }, ...nodes]);
    await wait(SPEED);
    endOp();
  };

  const insertTailDoubly = async (val) => {
    /**
     * Algorithm for Inserting a Node at the Ending (Doubly Linked List):
     * 1. Create a new node.
     * 2. If the list is empty, make the new node the head and return.
     * 3. Traverse the list until the last node.
     * 4. Update the right pointer (next) of the last node to point to the new node.
     * 5. Update the left pointer (prev) of the new node to point to the last node.
     * 6. Set the right pointer (next) of the new node to NULL.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("2. Insert End (Doubly)");
    if (nodes.length === 0) { 
        log("Step 2: List empty. New node is Head.");
        await insertHeadDoubly(val); 
        return; 
    }
    
    log("Step 3: Traverse list until the last node.");
    for(let i=0; i<nodes.length; i++) { 
        setPointers({curr: i}); 
        await wait(SPEED/4); 
    }
    
    log("Step 4: Update next of last node to point to new node.");
    log("Step 5: Update prev of new node to point to last node.");
    setNodes([...nodes, { id: Date.now(), value: val }]);
    await wait(SPEED);
    endOp();
  };

  const insertAtPosDoubly = async (val, key, pos) => {
    /**
     * Algorithm for Inserting a Node at the Middle (Doubly Linked List):
     * 1. Traverse the list to the node just BEFORE the desired position.
     * 2. Create the new node.
     * 3. Update the new node's next pointer to point to the current node's next.
     * 4. Update the new node's prev pointer to point to the current node.
     * 5. If the node after the new node exists, update its prev pointer to point to the new node.
     * 6. Update the current node's next pointer to point to the new node.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    if (idx < 0 || idx > nodes.length) { log("Pos out of bounds."); return; }
    
    setIsAnimating(true); resetSim();
    log("3. Insert At Position (Doubly)");
    
    if (idx === 0) { await insertHeadDoubly(val); return; }

    log("Step 1: Traverse to the node just BEFORE the position.");
    for(let i=0; i<idx; i++) { setPointers({curr: i}); await wait(SPEED/2); }
    
    log("Step 2-6: Create node and update next/prev pointers.");
    const newArr = [...nodes];
    newArr.splice(idx, 0, { id: Date.now(), value: val });
    setNodes(newArr);
    endOp();
  };

  const deleteHeadDoubly = async () => {
    /**
     * Algorithm for Deleting the First Node (Doubly Linked List):
     * 1. Create a temporary node which will point to the same node as that of head.
     * 2. Move the head pointer to the next node.
     * 3. If the new head is not NULL, change the new head's left pointer (prev) to NULL.
     * 4. Dispose of the temporary node.
     */
    if (isAnimating) return;
    if (nodes.length === 0) { log("List is empty, nothing to delete."); return; }

    setIsAnimating(true); resetSim();
    log("4. Delete Beginning (Doubly)");
    log("Step 1: Create a temporary node pointing to head.");
    setPointers({ temp: 0 });
    await wait(SPEED);

    log("Step 2: Move head pointer to the next node.");
    log("Step 3: If new head exists, set its prev to NULL.");
    setNodes(nodes.slice(1));
    
    log("Step 4: Dispose of the temporary node.");
    endOp();
  };

  const deleteTailDoubly = async () => {
    /**
     * Algorithm for Deleting the Last Node (Doubly Linked List):
     * 1. Traverse the list to find the last node.
     * 2. Identify the node before the tail (last.prev).
     * 3. Update the next pointer of the node before the tail to NULL.
     * 4. Dispose of the tail node.
     */
    if (isAnimating) return;
    if (nodes.length === 0) { log("List is empty, nothing to delete."); return; }

    setIsAnimating(true); resetSim();
    log("5. Delete End (Doubly)");
    if(nodes.length === 1) { await deleteHeadDoubly(); return; }

    log("Step 1: Traverse to find the last node.");
    for(let i=0; i<nodes.length-1; i++) { setPointers({curr: i}); await wait(SPEED/4); }
    
    log("Step 2: Identify node before tail.");
    log("Step 3: Update prev node's next to NULL.");
    setNodes(nodes.slice(0, -1));
    
    log("Step 4: Dispose of the tail node.");
    endOp();
  };

  const deleteAtPosDoubly = async (val, key, pos) => {
    /**
     * Algorithm for Deleting an Intermediate Node (Doubly Linked List):
     * 1. Traverse the list to locate the node to be deleted.
     * 2. Change the previous node's next pointer to the next node of the current node.
     * 3. Change the next node's previous pointer to the previous node of the current node.
     * 4. Dispose of the current node.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty, nothing to delete."); return; }
    if (idx < 0 || idx >= nodes.length) { log("Invalid Pos."); return; }

    setIsAnimating(true); resetSim();
    log("6. Delete At Pos (Doubly)");

    if (pos === 1) { await deleteHeadDoubly(); return; }

    log("Step 1: Traverse to locate node to be deleted.");
    for(let i=0; i<idx; i++) { setPointers({curr: i}); await wait(SPEED/2); }
    
    log("Step 2 & 3: Update pointers (prev.next and next.prev) to skip current node.");
    setNodes(nodes.filter((_, i) => i !== idx));
    
    log("Step 4: Dispose of the current node.");
    endOp();
  };

  const traverseDoubly = async () => {
    /**
     * Algorithm for Traversing/Printing (Doubly Linked List):
     * 1. Initialize a pointer `curr` to the head of the list.
     * 2. While `curr` is not NULL:
     * - Access and print the data of the current node.
     * - Move `curr` to the next node (`curr = curr.next`).
     */
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }

    setIsAnimating(true); resetSim();
    log("7. Traverse (Doubly)");
    
    log("Step 1: Initialize pointer `curr` to head.");
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        log(`Step 2: Print data [${nodes[i].value}]. Move curr.`);
        await wait(SPEED);
    }
    endOp();
  };

  const getLengthDoubly = async () => {
    /**
     * Algorithm for Finding Length of Linked List:
     * 1. Initialize count as 0.
     * 2. Initialize a node pointer, curr = head.
     * 3. While curr is not NULL:
     * - Increment count by 1.
     * - Move curr to the next node.
     * 4. Return count.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("8. Length (Doubly)");
    let count = 0;
    log("Step 1: Init count = 0.");
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        count++;
        log(`Step 3: Count = ${count}. Move curr.`);
        await wait(SPEED/2);
    }
    log(`Step 4: Return Count`+ " "+ "(" + count + ")");
    endOp();
  };

  const searchKeyDoubly = async (val, key) => {
    /**
     * Algorithm for Searching a Linked List:
     * 1. Initialize a node pointer, curr = head.
     * 2. While current is not NULL:
     * - If the current value is equal to the key being searched return true.
     * - Else, move to the next node.
     * 3. If key is not found, return false.
     */
    const target = key;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }

    setIsAnimating(true); resetSim();
    log("9. Search (Doubly)");
    let found = false;
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        if (nodes[i].value === target) {
            setFoundIndex(i);
            log(`Step 2: Found Key ${target}! Return True.`);
            found = true;
            await wait(SPEED);
            break;
        }
        await wait(SPEED/2);
    }
    if (!found) log("Step 3: Key not found. Return False.");
    endOp();
  };

  const sortDoubly = async () => {
    /**
     * Algorithm for Sorting the Linked List:
     * 1. Initialize a pointer `p` to the head of the list.
     * 2. Start an outer loop that runs until `p` is NULL.
     * 3. Inside the outer loop, initialize a pointer `q` to the node next to `p`.
     * 4. Start an inner loop that runs until `q` is NULL.
     * 5. Compare the data of node `p` and node `q`.
     * 6. If the data in `q` is less than the data in `p`, swap the data values.
     * (Note: Only data is swapped, pointers remain unchanged).
     * 7. Move `q` to the next node.
     * 8. After the inner loop finishes, move `p` to the next node.
     */
    if (nodes.length < 2 || isAnimating) return;
    setIsAnimating(true); resetSim();
    log("10. Sort (Doubly)");
    let arr = [...nodes];
    let swapped;
    
    // Bubble sort variant to match behavior
    do {
        swapped = false;
        for (let i = 0; i < arr.length - 1; i++) {
            setPointers({ p: i, q: i+1 });
            await wait(SPEED/2);
            if (arr[i].value > arr[i+1].value) {
                log(`Step 6: Swap data ${arr[i].value} > ${arr[i+1].value}`);
                let temp = arr[i]; arr[i] = arr[i+1]; arr[i+1] = temp;
                swapped = true;
                setNodes([...arr]);
                await wait(SPEED);
            }
        }
    } while (swapped);
    log("Sorted.");
    endOp();
  };

  const retrieveAtPosDoubly = async (val, key, pos) => {
    /**
     * Algorithm for Getting Nth Node:
     * 1. Initialize `current` to head and `count` to 1.
     * 2. Traverse the list while `current` is not NULL.
     * 3. If `count` matches `n`, return `current.data`.
     * 4. Increment `count` and move `current` to next node.
     * 5. If loop finishes, return NULL.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }
    
    setIsAnimating(true); resetSim();
    log("11. Retrieval (Doubly)");
    
    if (idx < 0 || idx >= nodes.length) {
        log(`Index ${pos} out of bounds.`);
        endOp();
        return;
    }
    
    log("Step 1: Init current=head, count=1");
    for (let i = 0; i <= idx; i++) {
        setPointers({ curr: i });
        log(`Step 4: Count: ${i+1}. Move current.`);
        await wait(SPEED/2);
    }
    log(`Step 3: Count matches. Return ${nodes[idx].value}`);
    setFoundIndex(idx);
    endOp();
  };


  // ==========================================
  // --- 3. CIRCULAR LINKED LIST OPERATIONS ---
  // ==========================================

  const insertTailCircular = async (val) => {
    /**
     * Algorithm for Inserting a Node at the End of a Circular Linked List:
     * 1. Create a new node and initially keep its next pointer pointing to itself.
     * 2. Update the next pointer of the new node with the head node.
     * 3. Traverse the list to the tail.
     * 4. Update the next pointer of the previous node (tail) to point to the new node.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("1. Insert End (Circular)");
    log(`Step 1: Create a new node [${val}]. next -> self.`);
    
    if (nodes.length === 0) {
        log("List Empty. Head = NewNode.");
        setNodes([{ id: Date.now(), value: val }]);
        setIsAnimating(false);
        return;
    }
    
    log("Step 2: Update next pointer of new node to Head.");
    log("Step 3: Traverse the list to the tail.");
    for(let i=0; i<nodes.length; i++) { setPointers({curr: i}); await wait(SPEED/4); }

    log("Step 4: Update next pointer of tail to point to new node.");
    setNodes([...nodes, { id: Date.now(), value: val }]);
    await wait(SPEED);
    endOp();
  };

  const insertHeadCircular = async (val) => {
    /**
     * Algorithm for Inserting a Node at the Front of a Circular Linked List:
     * 1. Create a new node and initially keep its next pointer pointing to itself.
     * 2. Update the next pointer of the new node with the head node.
     * 3. Traverse the list until the tail.
     * 4. Update the previous head node (tail) in the list to point to the new node.
     * 5. Make the new node as the head.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("2. Insert Front (Circular)");
    log(`Step 1: Create new node [${val}] pointing to itself.`);
    await wait(SPEED);
    
    if (nodes.length === 0) {
        log("List Empty. Head = NewNode.");
        setNodes([{ id: Date.now(), value: val }]);
        setIsAnimating(false);
        return;
    }

    log("Step 2: Update next pointer of new node with head.");
    log("Step 3: Traverse the list until the tail.");
    for(let i=0; i<nodes.length; i++) { setPointers({curr: i}); await wait(SPEED/4); }
    
    log("Step 4: Update tail to point to new node.");
    log("Step 5: Make new node the head.");
    setNodes([{ id: Date.now(), value: val }, ...nodes]);
    await wait(SPEED);
    endOp();
  };

  const insertAtPosCircular = async (val, key, pos) => {
    /**
     * Algorithm for Inserting a Node at a Specific Position (Circular List):
     * 1. Check if list is empty.
     * 2. If position is 1, create new node, set its next pointer to current head,
     * set last node's next pointer to new node, update head to point to new node.
     * 3. If position is not 1: Traverse the list to reach the node just before the desired position (position - 1).
     * 4. Set the new node's next pointer to point to the node that was previously at the desired position.
     * 5. Set the (position-1)-th node's next pointer to the new node.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    
    if (nodes.length === 0) {
        if (pos === 1) { 
            await insertHeadCircular(val); 
            return;
        } else {
            log("Invalid position! List is empty, position must be 1.");
            return;
        }
    }

    if (idx < 0 || idx > nodes.length) { log("Out of Bounds."); return; }

    setIsAnimating(true); resetSim();
    log("3. Insert At Pos (Circular)");

    if (pos === 1) { await insertHeadCircular(val); return; }

    log(`Step 3: Traverse to node just before position.`);
    for(let i=0; i<idx; i++) { setPointers({curr: i}); await wait(SPEED/2); }
    
    if (idx === nodes.length) { await insertTailCircular(val); return; }

    log("Step 4 & 5: Update next pointers to insert node.");
    const newArr = [...nodes];
    newArr.splice(idx, 0, { id: Date.now(), value: val });
    setNodes(newArr);
    endOp();
  };

  const deleteTailCircular = async () => {
    /**
     * Algorithm for Deleting the Last Node in a Circular List:
     * 1. Traverse the list to reach the last but one node.
     * 2. This node has to be named as the tail node, and its next field has to point to the first node.
     * 3. Dispose of the old tail node.
     */
    if (isAnimating) return;
    if (nodes.length === 0) { log("List is empty, nothing to delete."); return; }

    setIsAnimating(true); resetSim();
    log("4. Delete Last Node (Circular)");

    if (nodes.length === 1) { await deleteHeadCircular(); return; }

    log("Step 1: Traverse to last but one node.");
    for(let i=0; i<nodes.length-1; i++) { setPointers({curr: i}); await wait(SPEED/4); }
    
    log("Step 2: This node becomes tail, next points to first.");
    setNodes(nodes.slice(0, -1));
    log("Step 3: Dispose old tail.");
    endOp();
  };

  const deleteHeadCircular = async () => {
    /**
     * Algorithm for Deleting the First Node in a Circular List:
     * 1. Find the tail node of the linked list by traversing the list.
     * Tail node is the previous node to the head node.
     * 2. Create a temporary node which will point to the head.
     * 3. Update the tail nodes next pointer to point to next node of head.
     * 4. Move the head pointer to next node.
     * 5. Dispose of the temporary node.
     */
    if (isAnimating) return;
    if (nodes.length === 0) { log("List is empty, nothing to delete."); return; }

    setIsAnimating(true); resetSim();
    log("5. Delete First Node (Circular)");
    
    if (nodes.length === 1) {
        log("Only 1 node. Head = NULL.");
        setNodes([]);
        endOp();
        return;
    }

    log("Step 1: Find the tail node.");
    for(let i=0; i<nodes.length; i++) { setPointers({curr: i}); await wait(SPEED/4); }
    
    log("Step 2: Create temp node pointing to head.");
    // Visualizing head deletion by skipping first element
    log("Step 3 & 4: Update tail next and move Head.");
    setNodes(nodes.slice(1));
    
    log("Step 5: Dispose temporary node.");
    endOp();
  };

  const deleteByValueCircular = async (val, key) => {
    /**
     * Algorithm for Deleting a Specific Node from a Circular Linked List:
     * 1. Check if the list is empty.
     * 2. If it has only one node and matches the key, delete it and set list to empty.
     * 3. Otherwise, traverse with two pointers (current and previous) to find the node.
     * 4. If found, adjust the links to remove it.
     * 5. If not found, leave the list unchanged.
     */
    const target = key;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty, nothing to delete."); return; }

    setIsAnimating(true); resetSim();
    log("6. Delete Specific Node (Circular)");
    
    log(`Step 3: Traverse with two pointers to find node.`);
    let foundIdx = -1;
    for(let i=0; i<nodes.length; i++) {
        setPointers({curr: i, prev: i-1 >= 0 ? i-1 : nodes.length-1});
        if (nodes[i].value === target) { foundIdx = i; break; }
        await wait(SPEED/2);
    }

    if (foundIdx === -1) {
        log("Step 5: Key not found.");
        endOp();
        return;
    }

    if (foundIdx === 0) { await deleteHeadCircular(); return; }
    if (foundIdx === nodes.length - 1) { await deleteTailCircular(); return; }

    log("Step 4: Found. Adjust links to remove it.");
    setNodes(nodes.filter((_, i) => i !== foundIdx));
    endOp();
  };

  const traverseCircular = async () => {
    /**
     * Algorithm for Traversing a Circular Linked List:
     * 1. Start from the head node (last.next).
     * 2. Loop through the list printing data.
     * 3. Stop when the current node reaches the head node again.
     */
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }

    setIsAnimating(true); resetSim();
    log("7. Traverse (Circular)");
    
    log("Step 1: Start from Head.");
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        log(`Step 2: Print [${nodes[i].value}]`);
        await wait(SPEED);
    }
    log("Step 3: Reached Head again. Stop.");
    endOp();
  };

  const getLengthCircular = async () => {
    /**
     * Algorithm for Counting Nodes in a Circular Linked List:
     * 1. The list is accessible through the node marked head (or tail).
     * 2. Set the current pointer to the first node.
     * 3. Keep on counting till the current pointer reaches the starting node.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("8. Length (Circular)");
    let count = 0;
    log("Step 2: Set current pointer to first node.");
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        count++;
        log(`Step 3: Counting... ${count}`);
        await wait(SPEED/2);
    }
    log(`Result: ${count}`);
    endOp();
  };

  const searchKeyCircular = async (val, key) => {
    /**
     * Algorithm for Searching in a Circular Linked List:
     * 1. Set a pointer to the head node.
     * 2. Traverse the list node by node.
     * 3. Compare each node's data with the key.
     * 4. If match found, return True.
     * 5. Stop if we circle back to the head. If not found by then, return False.
     */
    const target = key;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }

    setIsAnimating(true); resetSim();
    log("9. Search (Circular)");
    let found = false;
    log("Step 1: Set pointer to Head.");
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        if (nodes[i].value === target) {
            setFoundIndex(i);
            log("Step 4: Match found! Return True.");
            found = true;
            await wait(SPEED);
            break;
        }
        await wait(SPEED/2);
    }
    if (!found) log("Step 5: Circled back. Return False.");
    endOp();
  };

  const sortCircular = async () => {
    /**
     * Algorithm for Sorting the Circular Linked List:
     * 1. Initialize a pointer `p` to the head of the list.
     * 2. Start an outer loop that runs until `p` circles back to the end (self.last).
     * 3. Inside the outer loop, initialize a pointer `q` to the node next to `p`.
     * 4. Start an inner loop that runs until `q` circles back to the head.
     * 5. Compare the data of node `p` and node `q`.
     * 6. If the data in `q` is less than the data in `p`, swap the data values.
     * 7. Move `q` to the next node.
     * 8. After the inner loop finishes, move `p` to the next node.
     */
    if (nodes.length < 2 || isAnimating) return;
    setIsAnimating(true); resetSim();
    log("10. Sort (Circular)");
    let arr = [...nodes];
    let swapped;
    
    // Simulating bubble sort visualization
    do {
        swapped = false;
        for (let i = 0; i < arr.length - 1; i++) {
            setPointers({ p: i, q: i+1 });
            await wait(SPEED/2);
            if (arr[i].value > arr[i+1].value) {
                log(`Step 6: Swap data.`);
                let temp = arr[i]; arr[i] = arr[i+1]; arr[i+1] = temp;
                swapped = true;
                setNodes([...arr]);
                await wait(SPEED);
            }
        }
    } while (swapped);
    log("Sorted.");
    endOp();
  };

  const retrieveAtPosCircular = async (val, key, pos) => {
    /**
     * Algorithm for Getting Nth Node (Circular List):
     * 1. Initialize `current` to head and `count` to 1.
     * 2. Traverse the list.
     * 3. If `count` matches `n`, return `current.data`.
     * 4. Increment `count` and move to next node.
     * 5. If we circle back to head without finding index, return NULL.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }
    
    if (idx < 0 || idx >= nodes.length) {
        log(`Step 5: Circled back/Out of bounds.`);
        setIsAnimating(false);
        return;
    }
    
    setIsAnimating(true); resetSim();
    log("11. Retrieval (Circular)");

    log("Step 1: Init current=head, count=1");
    for (let i = 0; i <= idx; i++) {
        setPointers({ curr: i });
        log(`Step 4: Count: ${i+1}`);
        await wait(SPEED/2);
    }
    log(`Step 3: Match! Return ${nodes[idx].value}`);
    setFoundIndex(idx);
    endOp();
  };


  // ==========================================
  // --- 4. CIRCULAR DOUBLY LINKED LIST OPERATIONS ---
  // ==========================================

  const insertHeadCircularDoubly = async (val) => {
    /**
     * Algorithm for Inserting at Front (Circular Doubly):
     * 1. Update right pointer (next) of new node to point to head.
     * 2. Update left pointer (prev) of new node to point to tail (head.prev).
     * 3. Update tail's next to point to new node.
     * 4. Update head's prev to point to new node.
     * 5. Make new node as head.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("1. Insert Beginning (Circ-Doubly)");
    
    if (nodes.length === 0) {
        log("List Empty. New.next/prev -> Self.");
        setNodes([{ id: Date.now(), value: val }]);
        setIsAnimating(false);
        return;
    }

    log("Step 1&2: New.next -> Head, New.prev -> Tail.");
    log("Step 3: Update Tail.next.");
    log("Step 4: Update Head.prev.");
    log("Step 5: Make new node as Head.");
    setNodes([{ id: Date.now(), value: val }, ...nodes]);
    await wait(SPEED);
    endOp();
  };

  const insertTailCircularDoubly = async (val) => {
    /**
     * Algorithm for Inserting at End (Circular Doubly):
     * 1. Traverse to the end (or find using head.prev).
     * 2. Update right pointer (next) of new node to point to head.
     * 3. Update left pointer (prev) of new node to point to tail.
     * 4. Update tail's next to point to new node.
     * 5. Update head's prev to point to new node.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("2. Insert End (Circ-Doubly)");

    if (nodes.length === 0) { await insertHeadCircularDoubly(val); return; }

    log("Step 1: Identify Tail (Head.prev).");
    log("Step 2&3: New.next -> Head, New.prev -> Tail.");
    log("Step 4 & 5: Update Tail.next and Head.prev.");
    setNodes([...nodes, { id: Date.now(), value: val }]);
    await wait(SPEED);
    endOp();
  };

  const insertAtPosCircularDoubly = async (val, key, pos) => {
    /**
     * Algorithm for Inserting at Middle (Circular Doubly):
     * 1. Traverse to the position node.
     * 2. Adjust next and prev pointers of new node and neighboring nodes
     * to include new node in the chain while maintaining circular links.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    
    if (nodes.length === 0) { 
        if (pos === 1) {
            await insertHeadCircularDoubly(val); 
            return;
        } else {
            log("Position is out of bounds (list is empty)."); 
            return;
        }
    }

    if (idx < 0 || idx > nodes.length) { log("Out of Bounds."); return; }

    setIsAnimating(true); resetSim();
    log("3. Insert Middle (Circ-Doubly)");
    
    if (pos === 1) { await insertHeadCircularDoubly(val); return; }

    if (idx === nodes.length) { await insertTailCircularDoubly(val); return; }

    log("Step 1: Traverse to pos.");
    for(let i=0; i<idx; i++) { setPointers({curr: i}); await wait(SPEED/2); }
    
    log("Step 2: Adjust Next/Prev pointers of neighbors.");
    const newArr = [...nodes];
    newArr.splice(idx, 0, { id: Date.now(), value: val });
    setNodes(newArr);
    endOp();
  };

  const deleteHeadCircularDoubly = async () => {
    /**
     * Algorithm for Deleting Head (Circular Doubly):
     * 1. Update tail's next to point to head's next.
     * 2. Update head's next's prev to point to tail.
     * 3. Move head pointer to head's next.
     * 4. Dispose of old head.
     */
    if (isAnimating) return;
    if (nodes.length === 0) { log("List is empty, nothing to delete."); return; }

    setIsAnimating(true); resetSim();
    log("4. Delete Beginning (Circ-Doubly)");
    
    if (nodes.length === 1) {
        log("Head.next is Self. List Empty.");
        setNodes([]); 
        endOp();
        return;
    }

    log("Step 1 & 2: Update Tail.next and NewHead.prev.");
    log("Step 3: Move Head pointer.");
    setNodes(nodes.slice(1));
    await wait(SPEED);
    endOp();
  };

  const deleteTailCircularDoubly = async () => {
    /**
     * Algorithm for Deleting Last Node (Circular Doubly):
     * 1. Identify tail node and node before tail.
     * 2. Update node before tail's next to point to head.
     * 3. Update head's prev to point to node before tail.
     * 4. Dispose tail.
     */
    if (isAnimating) return;
    if (nodes.length === 0) { log("List is empty, nothing to delete."); return; }

    setIsAnimating(true); resetSim();
    log("5. Delete End (Circ-Doubly)");

    if (nodes.length === 1) { await deleteHeadCircularDoubly(); return; }

    log("Step 1: Identify Tail.");
    log("Step 2: Prev.next -> Head.");
    log("Step 3: Head.prev -> Prev.");
    setNodes(nodes.slice(0, -1));
    await wait(SPEED);
    endOp();
  };

  const deleteAtPosCircularDoubly = async (val, key, pos) => {
    /**
     * Algorithm for Deleting Intermediate Node (Circular Doubly):
     * 1. Traverse to the node at position x.
     * 2. Update previous node's next to skip current node.
     * 3. Update next node's prev to skip current node.
     * 4. Dispose current node.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty, nothing to delete."); return; }
    if (idx < 0 || idx >= nodes.length) { log("Invalid Pos."); return; }

    setIsAnimating(true); resetSim();
    log("6. Delete Middle (Circ-Doubly)");
    
    if (pos === 1) { await deleteHeadCircularDoubly(); return; }

    if (idx === nodes.length - 1) { await deleteTailCircularDoubly(); return; }

    log("Step 1: Traverse to pos.");
    for(let i=0; i<idx; i++) { setPointers({curr: i}); await wait(SPEED/2); }
    
    log("Step 2 & 3: Update neighbors to skip current.");
    setNodes(nodes.filter((_, i) => i !== idx));
    log("Step 4: Dispose node.");
    endOp();
  };

  const traverseCircDoubly = async () => {
    /**
     * Algorithm for Traversing (Circular Doubly):
     * 1. Initialize `curr` to head.
     * 2. While `curr` has not circled back to head:
     * - Print data.
     * - Move `curr` to `curr.next`.
     */
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }

    setIsAnimating(true); resetSim();
    log("7. Traverse (Circ-Doubly)");

    log("Step 1: Init curr to head.");
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        log(`Step 2: Print [${nodes[i].value}]`);
        await wait(SPEED);
    }
    log("Circled back. Stop.");
    endOp();
  };

  const getLengthCircDoubly = async () => {
    /**
     * Algorithm for Counting Nodes:
     * 1. Initialize `count` to 0.
     * 2. Traverse the circular list until `curr` comes back to head.
     * 3. Increment `count` in each step.
     * 4. Return `count`.
     */
    if (isAnimating) return; setIsAnimating(true); resetSim();
    log("8. Length (Circ-Doubly)");
    let count = 0;
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        count++;
        log(`Count: ${count}`);
        await wait(SPEED/2);
    }
    log("Return Count:" + " "+ "(" + count + ")");
    endOp();
  };

  const searchKeyCircDoubly = async (val, key) => {
    /**
     * Algorithm for Searching:
     * 1. Traverse the circular list node by node.
     * 2. Compare node data with `key`.
     * 3. If match found, return True.
     * 4. If traversal completes (circles back to head) without match, return False.
     */
    const target = key;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }

    setIsAnimating(true); resetSim();
    log("9. Search (Circ-Doubly)");
    let found = false;
    for (let i = 0; i < nodes.length; i++) {
        setPointers({ curr: i });
        if (nodes[i].value === target) {
            setFoundIndex(i);
            log("Step 3: Match found!");
            found = true;
            await wait(SPEED);
            break;
        }
        await wait(SPEED/2);
    }
    if (!found) log("Key not found.");
    endOp();
  };

  const sortCircDoubly = async () => {
    /**
     * Algorithm for Sorting the Circular Doubly Linked List:
     * 1. Initialize a pointer `p` to the head of the list.
     * 2. Start an outer loop that runs until `p` circles back to head.
     * 3. Inside the outer loop, initialize a pointer `q` to the node next to `p`.
     * 4. Start an inner loop that runs until `q` circles back to head.
     * 5. Compare the data of node `p` and node `q`.
     * 6. If the data in `q` is less than the data in `p`, swap the data values.
     * 7. Move `q` to the next node.
     * 8. After the inner loop finishes, move `p` to the next node.
     */
    if (nodes.length < 2 || isAnimating) return;
    setIsAnimating(true); resetSim();
    log("10. Sort (Circ-Doubly)");
    let arr = [...nodes];
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < arr.length - 1; i++) {
            setPointers({ p: i, q: i+1 });
            await wait(SPEED/2);
            if (arr[i].value > arr[i+1].value) {
                let temp = arr[i]; arr[i] = arr[i+1]; arr[i+1] = temp;
                swapped = true;
                setNodes([...arr]);
                await wait(SPEED);
            }
        }
    } while (swapped);
    log("Sorted.");
    endOp();
  };

  const retrieveAtPosCircDoubly = async (val, key, pos) => {
    /**
     * Algorithm for Getting Nth Node:
     * 1. Initialize `current` to head and `count` to 1.
     * 2. Traverse the list.
     * 3. If `count` matches `n`, return data.
     * 4. If list circles back to head, return NULL.
     */
    const idx = pos - 1;
    if (isAnimating) return; 
    if (nodes.length === 0) { log("List is empty."); return; }
    
    if (idx < 0 || idx >= nodes.length) {
        log(`Index ${pos} out of bounds.`);
        setIsAnimating(false);
        return;
    }
    for (let i = 0; i <= idx; i++) {
        setPointers({ curr: i });
        log(`Count: ${i+1}`);
        await wait(SPEED/2);
    }
    log(`Retrieved: ${nodes[idx].value}`);
    setFoundIndex(idx);
    endOp();
  };

  // --- Config: Buttons per List Type ---
  // Strictly mapped to CC4CASESTUD.py Menu Orders & Numbering
  const getOperations = () => {
      const ops = {
          singly: [
              { label: "1. Ins Start", icon: Plus, action: insertHeadSingly, req: ['val'] },
              { label: "2. Ins End", icon: Plus, action: insertTailSingly, req: ['val'] },
              { label: "3. Ins Bef Key", icon: Plus, action: insertBeforeKeySingly, req: ['val', 'key'] },
              { label: "4. Ins Aft Key", icon: Plus, action: insertAfterKeySingly, req: ['val', 'key'] },
              { label: "5. Del Start", icon: Trash2, action: deleteHeadSingly, req: [] },
              { label: "6. Del End", icon: Trash2, action: deleteTailSingly, req: [] },
              { label: "7. Del At Pos", icon: Trash2, action: deleteAtPosSingly, req: ['pos'] },
              { label: "8. Retrieval", icon: ArrowDown, action: retrieveAtPosSingly, req: ['pos'] },
              { label: "9. Traverse", icon: ArrowRight, action: traverseSingly, req: [] },
              { label: "10. Length", icon: Hash, action: getLengthSingly, req: [] },
              { label: "11. Search", icon: Search, action: searchKeySingly, req: ['key'] },
              { label: "12. Sort", icon: ArrowLeftRight, action: sortSingly, req: [] },
          ],
          doubly: [
              { label: "1. Ins Start", icon: Plus, action: insertHeadDoubly, req: ['val'] },
              { label: "2. Ins End", icon: Plus, action: insertTailDoubly, req: ['val'] },
              { label: "3. Ins At Pos", icon: Plus, action: insertAtPosDoubly, req: ['val', 'pos'] },
              { label: "4. Del Start", icon: Trash2, action: deleteHeadDoubly, req: [] },
              { label: "5. Del End", icon: Trash2, action: deleteTailDoubly, req: [] },
              { label: "6. Del At Pos", icon: Trash2, action: deleteAtPosDoubly, req: ['pos'] },
              { label: "7. Traverse", icon: ArrowRight, action: traverseDoubly, req: [] },
              { label: "8. Length", icon: Hash, action: getLengthDoubly, req: [] },
              { label: "9. Search", icon: Search, action: searchKeyDoubly, req: ['key'] },
              { label: "10. Sort", icon: ArrowLeftRight, action: sortDoubly, req: [] },
              { label: "11. Retrieval", icon: ArrowDown, action: retrieveAtPosDoubly, req: ['pos'] },
          ],
          circular: [
              { label: "1. Ins End", icon: Plus, action: insertTailCircular, req: ['val'] },
              { label: "2. Ins Start", icon: Plus, action: insertHeadCircular, req: ['val'] },
              { label: "3. Ins At Pos", icon: Plus, action: insertAtPosCircular, req: ['val', 'pos'] },
              { label: "4. Del Last", icon: Trash2, action: deleteTailCircular, req: [] },
              { label: "5. Del First", icon: Trash2, action: deleteHeadCircular, req: [] },
              { label: "6. Del By Val", icon: Trash2, action: deleteByValueCircular, req: ['key'] },
              { label: "7. Traverse", icon: ArrowRight, action: traverseCircular, req: [] },
              { label: "8. Length", icon: Hash, action: getLengthCircular, req: [] },
              { label: "9. Search", icon: Search, action: searchKeyCircular, req: ['key'] },
              { label: "10. Sort", icon: ArrowLeftRight, action: sortCircular, req: [] },
              { label: "11. Retrieval", icon: ArrowDown, action: retrieveAtPosCircular, req: ['pos'] },
          ],
          'circular-doubly': [
            { label: "1. Ins Start", icon: Plus, action: insertHeadCircularDoubly, req: ['val'] },
            { label: "2. Ins End", icon: Plus, action: insertTailCircularDoubly, req: ['val'] },
            { label: "3. Ins At Pos", icon: Plus, action: insertAtPosCircularDoubly, req: ['val', 'pos'] },
            { label: "4. Del Start", icon: Trash2, action: deleteHeadCircularDoubly, req: [] },
            { label: "5. Del End", icon: Trash2, action: deleteTailCircularDoubly, req: [] },
            { label: "6. Del At Pos", icon: Trash2, action: deleteAtPosCircularDoubly, req: ['pos'] },
            { label: "7. Traverse", icon: ArrowRight, action: traverseCircDoubly, req: [] },
            { label: "8. Length", icon: Hash, action: getLengthCircDoubly, req: [] },
            { label: "9. Search", icon: Search, action: searchKeyCircDoubly, req: ['key'] },
            { label: "10. Sort", icon: ArrowLeftRight, action: sortCircDoubly, req: [] },
            { label: "11. Retrieval", icon: ArrowDown, action: retrieveAtPosCircDoubly, req: ['pos'] },
          ]
      };
      return ops[listType];
  };

  // --- Render Views ---

  // 1. EXIT VIEW
  if (view === 'EXIT') {
      return (
          <div className={`min-h-screen w-full ${THEME.bg} flex items-center justify-center`}>
              <div className="text-center animate-in fade-in zoom-in duration-500">
                  <h1 className="text-4xl font-bold text-purple-400 mb-4">Goodbye!</h1>
                  <p className="text-slate-400">Application Terminated.</p>
                  <button onClick={()=>setView('MAIN')} className="mt-8 text-sm text-purple-600 hover:text-purple-400 underline cursor-pointer">
                      (Restart)
                  </button>
              </div>
          </div>
      );
  }

  // 2. MAIN MENU VIEW
  if (view === 'MAIN') {
      return (
          <div className={`min-h-screen w-full ${THEME.bg} flex flex-col items-center justify-center p-4`}>
              <div className="max-w-md w-full bg-slate-900 border border-purple-900/50 rounded-2xl p-8 shadow-2xl">
                  <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8 flex items-center justify-center gap-2">
                     <RefreshCw className="w-6 h-6 text-purple-400"/> Linked List Menu
                  </h1>
                  <div className="flex flex-col gap-3">
                      <button onClick={()=>enterListMode('singly')} className="p-4 bg-slate-800 hover:bg-purple-900/30 border border-slate-700 hover:border-purple-500 rounded-xl transition-all text-left flex items-center gap-3 group">
                          <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">1</span>
                          <span className="text-slate-200 font-medium">Singly Linked List</span>
                      </button>
                      <button onClick={()=>enterListMode('circular')} className="p-4 bg-slate-800 hover:bg-purple-900/30 border border-slate-700 hover:border-purple-500 rounded-xl transition-all text-left flex items-center gap-3 group">
                          <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">2</span>
                          <span className="text-slate-200 font-medium">Circular Linked List</span>
                      </button>
                      <button onClick={()=>enterListMode('doubly')} className="p-4 bg-slate-800 hover:bg-purple-900/30 border border-slate-700 hover:border-purple-500 rounded-xl transition-all text-left flex items-center gap-3 group">
                          <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">3</span>
                          <span className="text-slate-200 font-medium">Doubly Linked List</span>
                      </button>
                      <button onClick={()=>enterListMode('circular-doubly')} className="p-4 bg-slate-800 hover:bg-purple-900/30 border border-slate-700 hover:border-purple-500 rounded-xl transition-all text-left flex items-center gap-3 group">
                          <span className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">4</span>
                          <span className="text-slate-200 font-medium">Circular Doubly Linked List</span>
                      </button>
                      <div className="h-px bg-slate-800 my-2"></div>
                      <button onClick={exitApp} className="p-4 bg-slate-900 hover:bg-red-900/20 border border-slate-800 hover:border-red-500/50 rounded-xl transition-all text-left flex items-center gap-3 group text-red-400">
                          <span className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center text-red-400 font-bold text-sm group-hover:scale-110 transition-transform"><LogOut size={14}/></span>
                          <span className="font-medium">Exit</span>
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // 3. APP VIEW (List Operations)
  return (
    <div className={`min-h-screen w-full ${THEME.bg} text-slate-200 font-sans flex flex-col overflow-hidden`}>
      {/* Header */}
      <header className="p-3 md:p-4 border-b border-purple-900/50 flex items-center justify-between bg-purple-950/30">
        <h1 className="text-base md:text-lg font-bold text-purple-400 flex items-center gap-2">
           <RefreshCw className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">{listType.replace('-', ' ').toUpperCase()}</span><span className="sm:hidden">VISUALIZER</span>
        </h1>
        {appPhase === 'READY' && (
            <button onClick={backToMain} className="text-[10px] md:text-xs flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 md:px-3 md:py-1 bg-slate-800 rounded border border-slate-700">
                <ArrowLeft size={12}/> <span className="hidden sm:inline">Back to Main Menu</span><span className="sm:hidden">Menu</span>
            </button>
        )}
      </header>

      {/* Main Display */}
      <main className="flex-1 relative overflow-auto flex flex-col items-center justify-center p-4 md:p-8">
         <div className="absolute top-4 left-4 text-purple-500/20 text-2xl md:text-4xl font-black pointer-events-none uppercase opacity-20 select-none">
            {listType.replace('-', ' ')}
         </div>

         {/* Nodes */}
         <div className="relative flex items-center gap-0 p-8 min-w-max">
            
            {nodes.length > 0 ? nodes.map((node, i) => {
                const p = [];
                // Map generic pointers object to labels for this node index
                Object.entries(pointers).forEach(([label, idx]) => {
                    if (idx === i) p.push(label.toUpperCase());
                });
                
                // Add static labels based on position
                if(i===0) p.push("HEAD");
                if(i===nodes.length-1) p.push("TAIL");

                return <Node 
                          key={node.id} 
                          value={node.value} 
                          isHighlighted={Object.values(pointers).includes(i)} 
                          isFound={foundIndex===i} 
                          hasNext={i < nodes.length-1} 
                          type={listType} 
                          pointers={p}
                          isFirst={i===0}
                          isLast={i===nodes.length-1}
                          // Self pointing if circular and only 1 node
                          isSelfPointing={listType.includes('circular') && nodes.length === 1 && i === 0}
                       />;
            }) : (appPhase === 'READY' && <span className="text-slate-600 italic">List is Empty</span>)}
            
            {(listType.includes('circular')) && nodes.length > 1 && appPhase === 'READY' && <CircularConnector />}
         </div>
      </main>

      {/* Controls Panel */}
      <div className={`h-[50vh] md:h-[45vh] min-h-[350px] ${THEME.panel} border-t border-purple-900/50 flex flex-col md:flex-row`}>
        
        {/* Left: Setup & Operations */}
        <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-purple-900/50 flex flex-col gap-4 overflow-y-auto">
            
            {/* SETUP WIZARD */}
            {appPhase !== 'READY' ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 animate-in fade-in">
                    <h2 className="text-lg md:text-xl font-bold text-white mb-2">Initialization</h2>
                    <p className="text-purple-300 font-medium text-center">
                        {appPhase === 'SETUP_COUNT' ? "Step 1: How many nodes?" : `Step 2: Enter value for Node ${createdCount+1}`}
                    </p>
                    <div className="flex gap-2">
                        <input 
                            className="bg-slate-800 border border-slate-600 text-white px-4 py-2 rounded focus:outline-none focus:border-purple-500 text-center w-24 md:w-32" 
                            type="number" 
                            value={setupInput} 
                            onChange={e=>setSetupInput(e.target.value)} 
                            onKeyDown={e=>e.key==='Enter' && (appPhase==='SETUP_COUNT'?submitNodeCount():submitNodeValue())} 
                            autoFocus 
                            placeholder="#" 
                        />
                        <button 
                            className="bg-purple-700 hover:bg-purple-600 text-white px-4 md:px-6 py-2 rounded shadow transition-all font-medium text-sm md:text-base" 
                            onClick={appPhase==='SETUP_COUNT'?submitNodeCount:submitNodeValue}
                        >
                            Next <ArrowRight size={16} className="inline ml-1"/>
                        </button>
                    </div>
                    {appPhase === 'SETUP_VALUES' && (
                        <div className="w-48 md:w-64 bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
                            <div style={{width:`${(createdCount/nodesToCreate)*100}%`}} className="h-full bg-purple-500 transition-all duration-300"/>
                        </div>
                    )}
                    <button onClick={backToMain} className="mt-8 text-slate-500 hover:text-slate-300 text-sm underline">Cancel</button>
                </div>
            ) : (
                /* OPERATIONS AREA */
                <div className="h-full flex flex-col">
                    {/* If Pending Operation: Show Input Form. Else: Show Buttons */}
                    {pendingOp ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 animate-in fade-in zoom-in-95 duration-200">
                             <h3 className="text-purple-400 font-bold uppercase tracking-wider text-sm md:text-base">{pendingOp.label}</h3>
                             <div className="flex flex-wrap justify-center gap-4">
                                {pendingOp.req.includes('val') && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">Data Value</label>
                                        <input autoFocus type="text" value={opInputs.val} onChange={e => setOpInputs(prev => ({...prev, val: e.target.value}))} className="bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded focus:outline-none focus:border-purple-500 w-24 md:w-32 text-center" />
                                    </div>
                                )}
                                {pendingOp.req.includes('key') && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">Target Value (Key)</label>
                                        <input type="text" value={opInputs.key} onChange={e => setOpInputs(prev => ({...prev, key: e.target.value}))} className="bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded focus:outline-none focus:border-purple-500 w-24 md:w-32 text-center" />
                                    </div>
                                )}
                                {pendingOp.req.includes('pos') && (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase">Position (1-based)</label>
                                        <input type="text" value={opInputs.pos} onChange={e => setOpInputs(prev => ({...prev, pos: e.target.value}))} className="bg-slate-800 border border-slate-600 text-white px-3 py-2 rounded focus:outline-none focus:border-purple-500 w-24 md:w-32 text-center" />
                                    </div>
                                )}
                             </div>
                             <div className="flex gap-2 mt-2">
                                 <button onClick={confirmOp} className="bg-green-700 hover:bg-green-600 text-white px-4 md:px-6 py-2 rounded shadow flex items-center gap-2 text-sm font-bold">
                                     <Check size={16}/> Confirm
                                 </button>
                                 <button onClick={cancelOp} className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 md:px-4 py-2 rounded shadow flex items-center gap-2 text-sm font-bold">
                                     <X size={16}/> Cancel
                                 </button>
                             </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 animate-in slide-in-from-bottom-4 duration-500">
                            {getOperations().map((op, idx) => (
                                <button key={idx} onClick={() => handleOpClick(op)} disabled={isAnimating} className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-purple-500 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs py-2 md:py-2.5 px-1 h-auto flex flex-col items-center gap-1 text-center hover:scale-105 active:scale-95">
                                    <op.icon size={16} className="mb-0.5 text-purple-400"/> {op.label}
                                </button>
                            ))}
                            <button onClick={clearList} disabled={isAnimating} className="bg-orange-900/20 hover:bg-orange-900/40 text-orange-400 border border-orange-900/30 hover:border-orange-500 rounded transition-all text-xs py-2 md:py-2.5 px-1 flex flex-col items-center gap-1 text-center">
                                <Ban size={16} className="mb-0.5"/> Clear List
                            </button>
                            <button onClick={backToMain} disabled={isAnimating} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 hover:border-red-500 rounded transition-all text-xs py-2 md:py-2.5 px-1 flex flex-col items-center gap-1 text-center">
                                <LogOut size={16} className="mb-0.5"/> Main Menu
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Right: Logs */}
        <div className="w-full md:w-1/3 bg-slate-950 p-4 font-mono text-xs overflow-y-auto border-t md:border-t-0 md:border-l border-slate-800 h-1/3 md:h-auto">
            <h3 className="text-slate-500 font-bold mb-2 uppercase tracking-widest text-[10px]">System Log</h3>
            <div className="flex flex-col gap-1">
                {logs.length === 0 && <span className="text-slate-700 italic">Ready...</span>}
                {logs.map((l, i) => (
                    <div key={i} className="text-purple-300 border-l-2 border-purple-800 pl-2 py-0.5 animate-in fade-in slide-in-from-left-2 break-words">
                        <span className="text-slate-600 mr-2 select-none">[{i+1}]</span>{l}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}